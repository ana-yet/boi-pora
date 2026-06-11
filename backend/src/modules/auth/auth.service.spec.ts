import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { getModelToken } from '@nestjs/mongoose';
import { UnauthorizedException } from '@nestjs/common';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { User } from '../../schemas/user.schema';
import { Session } from '../../schemas/session.schema';
import { UserRole } from '../../common/enums';

const hash = (raw: string) =>
  crypto.createHash('sha256').update(raw).digest('hex');

/**
 * Minimal in-memory stand-in for the sessions collection — just enough
 * Mongoose surface for AuthService (create, findOne, updateOne/Many).
 */
class FakeSessionModel {
  docs: Array<Record<string, any>> = [];

  create = jest.fn((data: Record<string, any>) => {
    const doc = {
      _id: crypto.randomUUID(),
      revokedAt: null,
      rotatedAt: null,
      ...data,
      save: jest.fn().mockResolvedValue(undefined),
    };
    this.docs.push(doc);
    return Promise.resolve(doc);
  });

  findOne = jest.fn((filter: { refreshTokenHash: string }) => ({
    exec: () =>
      Promise.resolve(
        this.docs.find((d) => d.refreshTokenHash === filter.refreshTokenHash) ??
          null,
      ),
  }));

  updateMany = jest.fn(
    (filter: Record<string, any>, update: Record<string, any>) => ({
      exec: () => {
        let modified = 0;
        for (const d of this.docs) {
          const familyMatch =
            filter.familyId === undefined || d.familyId === filter.familyId;
          const userMatch =
            filter.userId === undefined || d.userId === filter.userId;
          if (familyMatch && userMatch && !d.revokedAt) {
            Object.assign(d, update);
            modified++;
          }
        }
        return Promise.resolve({ modifiedCount: modified });
      },
    }),
  );

  updateOne = jest.fn(
    (filter: Record<string, any>, update: Record<string, any>) => ({
      exec: () => {
        const d = this.docs.find(
          (doc) =>
            (filter.refreshTokenHash === undefined ||
              doc.refreshTokenHash === filter.refreshTokenHash) &&
            (filter._id === undefined || doc._id === filter._id) &&
            (filter.userId === undefined || doc.userId === filter.userId) &&
            !doc.revokedAt,
        );
        if (d) Object.assign(d, update);
        return Promise.resolve({
          matchedCount: d ? 1 : 0,
          modifiedCount: d ? 1 : 0,
        });
      },
    }),
  );
}

describe('AuthService (sessions)', () => {
  let service: AuthService;
  let sessions: FakeSessionModel;

  const user = {
    _id: 'user-1',
    email: 'reader@boipora.com',
    name: 'Reader',
    role: UserRole.USER,
  };

  const userModel = {
    findById: jest.fn(() => ({
      lean: () => ({ exec: () => Promise.resolve(user) }),
    })),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    sessions = new FakeSessionModel();
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModel },
        { provide: getModelToken(Session.name), useValue: sessions },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed.jwt') },
        },
      ],
    }).compile();
    service = moduleRef.get(AuthService);
  });

  async function seedSession(raw: string, overrides: Record<string, any> = {}) {
    return sessions.create({
      userId: user._id,
      refreshTokenHash: hash(raw),
      familyId: 'fam-1',
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + 60_000),
      ...overrides,
    });
  }

  it('rotates a valid refresh token within the same family', async () => {
    const old = await seedSession('raw-token');

    const result = await service.refresh('raw-token', {});

    expect(result.accessToken).toBe('signed.jwt');
    expect(result.refreshToken).toBeDefined();
    expect(result.refreshToken).not.toBe('raw-token');
    expect(old.rotatedAt).toBeInstanceOf(Date);

    const next = sessions.docs.find(
      (d) => d.refreshTokenHash === hash(result.refreshToken),
    );
    expect(next).toBeDefined();
    expect(next!.familyId).toBe('fam-1');
  });

  it('detects reuse of a rotated token and revokes the whole family', async () => {
    await seedSession('stolen', { rotatedAt: new Date() });
    const sibling = await seedSession('sibling', { familyId: 'fam-1' });

    await expect(service.refresh('stolen', {})).rejects.toThrow(
      UnauthorizedException,
    );
    expect(sibling.revokedAt).toBeInstanceOf(Date);
  });

  it('rejects an expired refresh token', async () => {
    await seedSession('expired', {
      expiresAt: new Date(Date.now() - 1000),
    });
    await expect(service.refresh('expired', {})).rejects.toThrow(
      'Refresh token expired',
    );
  });

  it('rejects an unknown refresh token', async () => {
    await expect(service.refresh('never-issued', {})).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('logout revokes the session for the given token', async () => {
    const s = await seedSession('logout-me');
    await service.logout('logout-me');
    expect(s.revokedAt).toBeInstanceOf(Date);
  });

  it('logoutAll revokes every active session of the user', async () => {
    const a = await seedSession('a');
    const b = await seedSession('b', { familyId: 'fam-2' });
    const result = await service.logoutAll(user._id);
    expect(result.revoked).toBe(2);
    expect(a.revokedAt).toBeInstanceOf(Date);
    expect(b.revokedAt).toBeInstanceOf(Date);
  });
});

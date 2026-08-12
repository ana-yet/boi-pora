import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { MongoMemoryServer } from 'mongodb-memory-server';
import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { getModelToken } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import cookieParser from 'cookie-parser';
import { AppModule } from '../src/app.module';
import { SanitizePipe } from '../src/common/pipes/sanitize.pipe';

/**
 * Integration tests against the real AppModule on an in-memory MongoDB.
 * Covers the cookie-based auth lifecycle and the published-only book rule.
 */
describe('API integration (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let server: ReturnType<INestApplication['getHttpServer']>;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    // Env is read inside Nest's async config factories, which run during
    // compile() below — after these assignments.
    process.env.MONGODB_URI = mongod.getUri('boi-pora-test');
    process.env.JWT_SECRET = 'integration-test-secret';
    process.env.NODE_ENV = 'development';

    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.use(cookieParser());
    app.useGlobalPipes(
      new SanitizePipe(),
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
    server = app.getHttpServer();
  });

  afterAll(async () => {
    await app?.close();
    await mongod?.stop();
  });

  const email = 'reader@example.com';
  const password = 'Str0ng-password!';
  let accessToken: string;
  let refreshCookie: string;

  function extractRefreshCookie(res: request.Response): string | undefined {
    const raw = res.headers['set-cookie'] as string[] | string | undefined;
    const cookies = Array.isArray(raw) ? raw : raw ? [raw] : [];
    return cookies.find((c) => c.startsWith('boi_pora_refresh='));
  }

  describe('auth lifecycle', () => {
    it('registers and sets an HttpOnly refresh cookie', async () => {
      const res = await request(server)
        .post('/api/v1/auth/register')
        .send({ name: 'Reader', email, password })
        .expect(201);

      expect(res.body.accessToken).toBeDefined();
      expect(res.body.refreshToken).toBeUndefined();
      expect(res.body.user.email).toBe(email);

      const cookie = extractRefreshCookie(res);
      expect(cookie).toBeDefined();
      expect(cookie).toMatch(/HttpOnly/i);
    });

    it('logs in and reaches /me with the access token', async () => {
      const res = await request(server)
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(201);

      accessToken = res.body.accessToken;
      refreshCookie = extractRefreshCookie(res)!;

      const me = await request(server)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(me.body.email).toBe(email);
      expect(me.body.passwordHash).toBeUndefined();
    });

    it('rotates the refresh token on /refresh', async () => {
      const res = await request(server)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(200);

      expect(res.body.accessToken).toBeDefined();
      const newCookie = extractRefreshCookie(res)!;
      expect(newCookie).toBeDefined();
      expect(newCookie).not.toBe(refreshCookie);

      // Replaying the OLD cookie is reuse → 401 and the family dies.
      await request(server)
        .post('/api/v1/auth/refresh')
        .set('Cookie', refreshCookie)
        .expect(401);

      // The rotated descendant was revoked along with the family.
      await request(server)
        .post('/api/v1/auth/refresh')
        .set('Cookie', newCookie)
        .expect(401);
    });

    it('logout revokes the session', async () => {
      const login = await request(server)
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(201);
      const cookie = extractRefreshCookie(login)!;

      await request(server)
        .post('/api/v1/auth/logout')
        .set('Cookie', cookie)
        .expect(200);

      await request(server)
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookie)
        .expect(401);
    });

    it('refresh without a cookie → 401', async () => {
      await request(server).post('/api/v1/auth/refresh').expect(401);
    });
  });

  describe('authorization', () => {
    it('blocks normal users from admin routes (403)', async () => {
      const login = await request(server)
        .post('/api/v1/auth/login')
        .send({ email, password })
        .expect(201);
      await request(server)
        .get('/api/v1/admin/books')
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .expect(403);
    });

    it('blocks anonymous requests to admin routes (401)', async () => {
      await request(server).get('/api/v1/admin/books').expect(401);
    });
  });

  describe('published-only books', () => {
    beforeAll(async () => {
      const bookModel = app.get<Model<Record<string, unknown>>>(
        getModelToken('Book'),
      );
      await bookModel.create([
        {
          title: 'Public Book',
          slug: 'public-book',
          author: 'A',
          category: 'fiction',
          status: 'published',
        },
        {
          title: 'Secret Draft',
          slug: 'secret-draft',
          author: 'A',
          category: 'fiction',
          status: 'draft',
        },
      ]);
    });

    it('GET /books returns only published books', async () => {
      const res = await request(server).get('/api/v1/books').expect(200);
      const slugs = res.body.items.map((b: { slug: string }) => b.slug);
      expect(slugs).toContain('public-book');
      expect(slugs).not.toContain('secret-draft');
    });

    it('GET /books?status=draft cannot widen the filter', async () => {
      const res = await request(server)
        .get('/api/v1/books?status=draft')
        .expect(200);
      const slugs = res.body.items.map((b: { slug: string }) => b.slug);
      expect(slugs).not.toContain('secret-draft');
    });

    it('a draft slug 404s publicly', async () => {
      await request(server).get('/api/v1/books/slug/secret-draft').expect(404);
    });

    it('admins can list drafts via the admin route', async () => {
      const adminEmail = 'admin@example.com';
      const userModel = app.get<Model<Record<string, unknown>>>(
        getModelToken('User'),
      );
      await userModel.create({
        email: adminEmail,
        passwordHash: await bcrypt.hash(password, 12),
        name: 'Admin',
        role: 'admin',
        authProvider: 'local',
      });
      const login = await request(server)
        .post('/api/v1/auth/login')
        .send({ email: adminEmail, password })
        .expect(201);

      const res = await request(server)
        .get('/api/v1/admin/books?status=draft')
        .set('Authorization', `Bearer ${login.body.accessToken}`)
        .expect(200);
      const slugs = res.body.items.map((b: { slug: string }) => b.slug);
      expect(slugs).toContain('secret-draft');
    });
  });
});

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument } from '../../schemas/user.schema';
import { Session, SessionDocument } from '../../schemas/session.schema';
import { UserRole } from '../../common/enums';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface SessionContext {
  userAgent?: string;
  ip?: string;
}

export interface AuthResult {
  accessToken: string;
  /** Raw refresh token — only ever sent as an HttpOnly cookie. */
  refreshToken: string;
  user: { id: string; email: string; name?: string; role: UserRole };
}

const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
    private jwtService: JwtService,
  ) {}

  private signAccessToken(userId: string, role: UserRole, sessionId: string) {
    return this.jwtService.sign({ sub: userId, role, sessionId });
  }

  private async createSession(
    userId: string,
    ctx: SessionContext,
    familyId?: string,
  ) {
    const refreshToken = crypto.randomBytes(32).toString('hex');
    const session = await this.sessionModel.create({
      userId,
      refreshTokenHash: hashToken(refreshToken),
      familyId: familyId ?? crypto.randomUUID(),
      userAgent: ctx.userAgent,
      ip: ctx.ip,
      lastUsedAt: new Date(),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    });
    return { refreshToken, session };
  }

  private async issueAuth(
    user: Pick<UserDocument, 'email' | 'role' | 'name'> & { _id: unknown },
    ctx: SessionContext,
  ): Promise<AuthResult> {
    const userId = String(user._id);
    const { refreshToken, session } = await this.createSession(userId, ctx);
    return {
      accessToken: this.signAccessToken(userId, user.role, String(session._id)),
      refreshToken,
      user: { id: userId, email: user.email, name: user.name, role: user.role },
    };
  }

  async register(dto: RegisterDto, ctx: SessionContext): Promise<AuthResult> {
    const existing = await this.userModel.findOne({ email: dto.email }).exec();
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const hash = await bcrypt.hash(dto.password, 12);
    const user = await this.userModel.create({
      email: dto.email,
      passwordHash: hash,
      name: dto.name,
      role: UserRole.USER,
      authProvider: 'local',
      isVerified: false,
    });
    return this.issueAuth(user, ctx);
  }

  async login(dto: LoginDto, ctx: SessionContext): Promise<AuthResult> {
    const user = await this.userModel
      .findOne({ email: dto.email })
      .select('+passwordHash')
      .exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueAuth(user, ctx);
  }

  /**
   * Rotate a refresh token. A valid, unused token yields a new session row
   * in the same family. A token that was already rotated or revoked is a
   * replay — the whole family is revoked.
   */
  async refresh(
    rawToken: string,
    ctx: SessionContext,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const session = await this.sessionModel
      .findOne({ refreshTokenHash: hashToken(rawToken) })
      .exec();
    if (!session) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    if (session.rotatedAt || session.revokedAt) {
      // Reuse detected: kill every session descended from this login.
      await this.sessionModel
        .updateMany(
          { familyId: session.familyId, revokedAt: null },
          { revokedAt: new Date() },
        )
        .exec();
      throw new UnauthorizedException('Refresh token reuse detected');
    }
    if (session.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedException('Refresh token expired');
    }
    const user = await this.userModel.findById(session.userId).lean().exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    session.rotatedAt = new Date();
    session.lastUsedAt = new Date();
    await session.save();

    const { refreshToken, session: next } = await this.createSession(
      String(user._id),
      ctx,
      session.familyId,
    );
    return {
      accessToken: this.signAccessToken(
        String(user._id),
        user.role,
        String(next._id),
      ),
      refreshToken,
    };
  }

  /** Revoke the session matching this refresh token (cookie). Idempotent. */
  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    await this.sessionModel
      .updateOne(
        { refreshTokenHash: hashToken(rawToken), revokedAt: null },
        { revokedAt: new Date() },
      )
      .exec();
  }

  async logoutAll(userId: string): Promise<{ revoked: number }> {
    const res = await this.sessionModel
      .updateMany({ userId, revokedAt: null }, { revokedAt: new Date() })
      .exec();
    return { revoked: res.modifiedCount };
  }

  /** Active (non-revoked, non-rotated, unexpired) sessions for the user. */
  async listSessions(userId: string, currentSessionId?: string) {
    const sessions = await this.sessionModel
      .find({
        userId,
        revokedAt: null,
        rotatedAt: null,
        expiresAt: { $gt: new Date() },
      })
      .sort({ lastUsedAt: -1 })
      .lean()
      .exec();
    return sessions.map((s) => ({
      id: String(s._id),
      userAgent: s.userAgent,
      ip: s.ip,
      lastUsedAt: s.lastUsedAt,
      createdAt: (s as { createdAt?: Date }).createdAt,
      current: String(s._id) === currentSessionId,
    }));
  }

  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const res = await this.sessionModel
      .updateOne(
        { _id: sessionId, userId, revokedAt: null },
        { revokedAt: new Date() },
      )
      .exec();
    if (res.matchedCount === 0) {
      throw new NotFoundException('Session not found');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userModel
      .findOne({ email })
      .select('+resetPasswordToken +resetPasswordExpires')
      .exec();
    if (!user)
      return { message: 'If an account exists, a reset link has been sent.' };
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();
    // TODO: Send email with reset link
    console.log(
      `[DEV] Reset link: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}/reset-password/${token}`,
    );
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userModel
      .findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: new Date() },
      })
      .select('+resetPasswordToken +resetPasswordExpires +passwordHash')
      .exec();
    if (!user)
      throw new UnauthorizedException('Invalid or expired reset token');
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    // Changing the password invalidates every existing session.
    await this.logoutAll(String(user._id));
    return { message: 'Password has been reset successfully' };
  }

  async me(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      isVerified: user.isVerified,
      createdAt: (user as { createdAt?: Date }).createdAt,
    };
  }
}

import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import { User, UserDocument } from '../../schemas/user.schema';
import { UserRole } from '../../common/enums';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly REFRESH_EXPIRES_IN = '30d';

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
  ) {}

  private generateTokens(userId: string, email: string, role: UserRole) {
    const payload = { sub: userId, email, role };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: this.REFRESH_EXPIRES_IN });
    return { accessToken, refreshToken };
  }

  async register(dto: RegisterDto) {
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
    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userModel.findOne({ email: dto.email }).select('+passwordHash').exec();
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
    return {
      ...tokens,
      user: {
        id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  async refreshToken(refreshTokenStr: string) {
    try {
      const payload = this.jwtService.verify(refreshTokenStr);
      const user = await this.userModel.findById(payload.sub).lean().exec();
      if (!user) throw new UnauthorizedException('User not found');
      const tokens = this.generateTokens(user._id.toString(), user.email, user.role);
      return tokens;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.userModel.findOne({ email }).select('+resetPasswordToken +resetPasswordExpires').exec();
    if (!user) return { message: 'If an account exists, a reset link has been sent.' };
    const token = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();
    // TODO: Send email with reset link
    console.log(`[DEV] Reset link: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}/reset-password/${token}`);
    return { message: 'If an account exists, a reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    }).select('+resetPasswordToken +resetPasswordExpires +passwordHash').exec();
    if (!user) throw new UnauthorizedException('Invalid or expired reset token');
    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return { message: 'Password has been reset successfully' };
  }

  async me(userId: string) {
    const user = await this.userModel.findById(userId).lean().exec();
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}

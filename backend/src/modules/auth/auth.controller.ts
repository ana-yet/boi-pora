import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  Res,
  UseGuards,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import type { Request, Response, CookieOptions } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

export const REFRESH_COOKIE = 'boi_pora_refresh';
const REFRESH_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

function cookieOptions(): CookieOptions {
  const sameSite = (process.env.COOKIE_SAMESITE || 'lax') as
    | 'lax'
    | 'none'
    | 'strict';
  return {
    httpOnly: true,
    // Cross-site deployments (frontend and API on different sites) must set
    // COOKIE_SAMESITE=none, which requires Secure.
    secure: process.env.NODE_ENV !== 'development' || sameSite === 'none',
    sameSite,
    path: '/api/v1/auth',
    maxAge: REFRESH_MAX_AGE_MS,
  };
}

function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, cookieOptions());
}

function clearRefreshCookie(res: Response) {
  const opts = cookieOptions();
  delete opts.maxAge;
  res.clearCookie(REFRESH_COOKIE, opts);
}

function sessionContext(req: Request) {
  return { userAgent: req.headers['user-agent'], ip: req.ip };
}

function refreshCookieOf(req: Request): string | undefined {
  const cookies = (req as { cookies?: Record<string, string> }).cookies;
  return cookies?.[REFRESH_COOKIE];
}

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } = await this.authService.register(
      dto,
      sessionContext(req),
    );
    setRefreshCookie(res, refreshToken);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { refreshToken, ...result } = await this.authService.login(
      dto,
      sessionContext(req),
    );
    setRefreshCookie(res, refreshToken);
    return result;
  }

  @Public()
  @Throttle({ default: { limit: 30, ttl: 900000 } })
  @Post('refresh')
  @HttpCode(200)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = refreshCookieOf(req);
    if (!raw) {
      clearRefreshCookie(res);
      throw new UnauthorizedException('No refresh token');
    }
    try {
      const { accessToken, refreshToken } = await this.authService.refresh(
        raw,
        sessionContext(req),
      );
      setRefreshCookie(res, refreshToken);
      return { accessToken };
    } catch (err) {
      clearRefreshCookie(res);
      throw err;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(200)
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(refreshCookieOf(req));
    clearRefreshCookie(res);
    return { message: 'Logged out' };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  @HttpCode(200)
  async logoutAll(
    @CurrentUser('sub') userId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.logoutAll(userId);
    clearRefreshCookie(res);
    return result;
  }

  @UseGuards(JwtAuthGuard)
  @Get('sessions')
  listSessions(
    @CurrentUser('sub') userId: string,
    @CurrentUser('sessionId') sessionId: string | undefined,
  ) {
    return this.authService.listSessions(userId, sessionId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('sessions/:id')
  async revokeSession(
    @CurrentUser('sub') userId: string,
    @Param('id') id: string,
  ) {
    await this.authService.revokeSession(userId, id);
    return { message: 'Session revoked' };
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @Post('forgot-password')
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 900000 } })
  @Post('reset-password/:token')
  resetPassword(@Param('token') token: string, @Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(token, dto.password);
  }

  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@CurrentUser('sub') userId: string) {
    return this.authService.me(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('me')
  updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateProfileDto,
  ) {
    return this.authService.updateProfile(userId, dto);
  }
}

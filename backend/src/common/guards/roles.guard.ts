import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { ROLES_KEY } from '../decorators/roles.decorator';
import type { JwtPayload } from '../interfaces/jwt-payload.interface';

type RequestWithUser = Request & { user?: JwtPayload };

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user?.role) {
      throw new ForbiddenException('Forbidden');
    }
    const hasRole = requiredRoles.includes(String(user.role));
    if (!hasRole) {
      throw new ForbiddenException('Admin access required');
    }
    return true;
  }
}

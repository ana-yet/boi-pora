import { UserRole } from '../enums';

export interface JwtPayload {
  sub: string;
  role: UserRole;
  sessionId: string;
}

/**
 * Single JWT secret fallback for development only.
 * Both token signing (AuthModule) and verification (JwtStrategy) must use
 * the same fallback, otherwise tokens become invalid when JWT_SECRET is unset.
 */
export const DEV_JWT_FALLBACK_SECRET =
  'boi-pora-dev-only-secret-change-in-prod';

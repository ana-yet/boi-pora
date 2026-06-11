import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type SessionDocument = Session & Document;

/**
 * One row per device login. The refresh token itself is never stored —
 * only its SHA-256 hash. `familyId` groups a rotation chain so that a
 * replayed (already-rotated) token can revoke the entire family.
 */
@Schema({ timestamps: true })
export class Session {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  refreshTokenHash: string;

  @Prop({ required: true, index: true })
  familyId: string;

  @Prop()
  userAgent?: string;

  @Prop()
  ip?: string;

  @Prop({ required: true })
  lastUsedAt: Date;

  @Prop({ required: true })
  expiresAt: Date;

  /** Set when this token was exchanged for a new one (normal rotation). */
  @Prop()
  rotatedAt?: Date;

  /** Set when the session was explicitly or defensively revoked. */
  @Prop()
  revokedAt?: Date;
}

export const SessionSchema = SchemaFactory.createForClass(Session);
// Mongo TTL cleanup once the refresh token is past its 30-day life.
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

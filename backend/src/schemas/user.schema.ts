import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop()
  name?: string;

  @Prop()
  avatarUrl?: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: 'local' })
  authProvider: string;

  @Prop()
  providerId?: string;

  @Prop({ default: false })
  isVerified: boolean;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ authProvider: 1, providerId: 1 }, { sparse: true });

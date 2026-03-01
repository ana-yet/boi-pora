import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReviewDocument = Review & Document;

@Schema({ timestamps: true })
export class Review {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ required: true, min: 1, max: 5 })
  rating: number;

  @Prop()
  content?: string;

  @Prop({ default: true })
  isPublic: boolean;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
ReviewSchema.index({ userId: 1, bookId: 1 }, { unique: true });
ReviewSchema.index({ bookId: 1 });

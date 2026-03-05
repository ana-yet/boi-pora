import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BookStatus } from '../common/enums';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true, maxlength: 500 })
  title: string;

  @Prop({ required: true, unique: true, maxlength: 500 })
  slug: string;

  @Prop({ required: true, maxlength: 200 })
  author: string;

  @Prop({ type: [String] })
  authors?: string[];

  @Prop({ maxlength: 5000 })
  description?: string;

  @Prop({ maxlength: 2000 })
  coverImageUrl?: string;

  @Prop({ maxlength: 100 })
  category?: string;

  @Prop({ type: [String] })
  genres?: string[];

  @Prop()
  pageCount?: number;

  @Prop()
  estimatedReadTimeMinutes?: number;

  @Prop({ default: 0 })
  rating: number;

  @Prop({ default: 0 })
  ratingCount: number;

  @Prop({ required: true, default: 'en', maxlength: 10 })
  language: string;

  @Prop({ type: String, enum: BookStatus, default: BookStatus.PUBLISHED })
  status: BookStatus;
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.index({ slug: 1 }, { unique: true });
BookSchema.index({ category: 1 });
BookSchema.index({ status: 1 });
BookSchema.index(
  { title: 'text', author: 'text', description: 'text' },
  { language_override: 'textSearchLang' },
);

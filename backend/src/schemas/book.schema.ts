import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BookDocument = Book & Document;

@Schema({ timestamps: true })
export class Book {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true, unique: true })
  slug: string;

  @Prop({ required: true })
  author: string;

  @Prop({ type: [String] })
  authors?: string[];

  @Prop()
  description?: string;

  @Prop()
  coverImageUrl?: string;

  @Prop()
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

  @Prop({ required: true, default: 'en' })
  language: string;

  @Prop({ default: 'published' })
  status: string;
}

export const BookSchema = SchemaFactory.createForClass(Book);
BookSchema.index({ slug: 1 }, { unique: true });
BookSchema.index({ category: 1 });
BookSchema.index({ status: 1 });
BookSchema.index(
  { title: 'text', author: 'text', description: 'text' },
  { language_override: 'textSearchLang' },
);

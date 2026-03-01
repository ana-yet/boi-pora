import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChapterDocument = Chapter & Document;

@Schema({ timestamps: true })
export class Chapter {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ required: true })
  chapterNumber: number;

  @Prop({ required: true })
  chapterId: string;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  content: string;

  @Prop()
  wordCount?: number;

  @Prop()
  order?: number;
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
ChapterSchema.index({ bookId: 1, chapterId: 1 }, { unique: true });
ChapterSchema.index({ bookId: 1 });

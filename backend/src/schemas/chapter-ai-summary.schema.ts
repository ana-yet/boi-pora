import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ChapterAiSummaryDocument = ChapterAiSummary & Document;

/** Cached Groq chapter summary; invalidated when chapter body changes (content hash mismatch). */
@Schema({ timestamps: true })
export class ChapterAiSummary {
  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ required: true })
  chapterId: string;

  @Prop({ required: true })
  contentHash: string;

  @Prop({ required: true })
  summary: string;

  @Prop()
  model?: string;
}

export const ChapterAiSummarySchema =
  SchemaFactory.createForClass(ChapterAiSummary);
ChapterAiSummarySchema.index({ bookId: 1, chapterId: 1 }, { unique: true });

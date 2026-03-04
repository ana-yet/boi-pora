import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ReadingProgressDocument = ReadingProgress & Document;

@Schema({ timestamps: true })
export class ReadingProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Chapter' })
  chapterId?: Types.ObjectId;

  @Prop()
  pageNumber?: number;

  @Prop()
  percentComplete?: number;

  @Prop()
  lastReadAt?: Date;
}

export const ReadingProgressSchema = SchemaFactory.createForClass(ReadingProgress);
ReadingProgressSchema.index({ userId: 1, bookId: 1 }, { unique: true });
ReadingProgressSchema.index({ userId: 1, lastReadAt: -1 });

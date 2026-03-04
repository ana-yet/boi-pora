import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LibraryItemDocument = LibraryItem & Document;

@Schema({ timestamps: true })
export class LibraryItem {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Book', required: true })
  bookId: Types.ObjectId;

  @Prop({ default: 'saved' })
  status: string;

  @Prop()
  addedAt?: Date;

  @Prop()
  startedAt?: Date;

  @Prop()
  finishedAt?: Date;
}

export const LibraryItemSchema = SchemaFactory.createForClass(LibraryItem);
LibraryItemSchema.index({ userId: 1, bookId: 1 }, { unique: true });
LibraryItemSchema.index({ userId: 1, status: 1 });
LibraryItemSchema.index({ userId: 1, addedAt: -1 });

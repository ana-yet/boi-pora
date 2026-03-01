import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReadingProgress, ReadingProgressDocument } from '../../schemas/reading-progress.schema';

@Injectable()
export class ReadingService {
  constructor(
    @InjectModel(ReadingProgress.name) private progressModel: Model<ReadingProgressDocument>,
  ) {}

  async findByUser(userId: string) {
    const items = await this.progressModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('bookId', 'title slug author coverImageUrl')
      .sort({ lastReadAt: -1 })
      .lean()
      .exec();
    return items;
  }

  async upsert(userId: string, bookId: string, data: { chapterId?: string; percentComplete?: number }) {
    const uid = new Types.ObjectId(userId);
    const bid = new Types.ObjectId(bookId);
    const existing = await this.progressModel.findOne({ userId: uid, bookId: bid }).exec();
    const payload: Record<string, unknown> = {
      lastReadAt: new Date(),
      percentComplete: data.percentComplete,
    };
    if (data.chapterId) payload.chapterId = new Types.ObjectId(data.chapterId);
    if (existing) {
      if (payload.chapterId) existing.chapterId = payload.chapterId as Types.ObjectId;
      if (payload.percentComplete != null) existing.percentComplete = payload.percentComplete as number;
      existing.lastReadAt = payload.lastReadAt as Date;
      await existing.save();
      return existing.toObject();
    }
    return this.progressModel.create({
      userId: uid,
      bookId: bid,
      chapterId: payload.chapterId as Types.ObjectId | undefined,
      percentComplete: payload.percentComplete as number | undefined,
      lastReadAt: payload.lastReadAt as Date,
    });
  }
}

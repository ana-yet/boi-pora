import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ReadingProgress, ReadingProgressDocument } from '../../schemas/reading-progress.schema';

@Injectable()
export class ReadingService {
  constructor(
    @InjectModel(ReadingProgress.name) private progressModel: Model<ReadingProgressDocument>,
  ) {}

  async findByUser(userId: string, limit = 50) {
    return this.progressModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate('bookId', 'title slug author coverImageUrl category')
      .populate('chapterId', '_id title chapterNumber')
      .sort({ lastReadAt: -1 })
      .limit(limit)
      .lean()
      .exec();
  }

  async upsert(userId: string, bookId: string, data: { chapterId?: string; percentComplete?: number }) {
    const uid = new Types.ObjectId(userId);
    const bid = new Types.ObjectId(bookId);

    const update: Record<string, unknown> = {
      lastReadAt: new Date(),
    };
    if (data.chapterId) update.chapterId = new Types.ObjectId(data.chapterId);
    if (data.percentComplete != null) update.percentComplete = data.percentComplete;

    return this.progressModel
      .findOneAndUpdate(
        { userId: uid, bookId: bid },
        { $set: update, $setOnInsert: { userId: uid, bookId: bid } },
        { upsert: true, new: true, lean: true },
      )
      .exec();
  }
}

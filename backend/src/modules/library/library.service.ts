import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LibraryItem, LibraryItemDocument } from '../../schemas/library-item.schema';

@Injectable()
export class LibraryService {
  constructor(
    @InjectModel(LibraryItem.name) private libraryItemModel: Model<LibraryItemDocument>,
  ) {}

  async findByUser(userId: string, page = 1, limit = 20) {
    const uid = new Types.ObjectId(userId);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.libraryItemModel
        .find({ userId: uid })
        .populate('bookId', 'title slug author coverImageUrl category')
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.libraryItemModel.countDocuments({ userId: uid }).exec(),
    ]);
    return { items, total, page, limit };
  }

  async add(userId: string, bookId: string) {
    const uid = new Types.ObjectId(userId);
    const bid = new Types.ObjectId(bookId);
    try {
      return await this.libraryItemModel.create({
        userId: uid,
        bookId: bid,
        status: 'saved',
        addedAt: new Date(),
      });
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
        throw new ConflictException('Already in library');
      }
      throw err;
    }
  }

  async checkStatus(userId: string, bookId: string) {
    const item = await this.libraryItemModel
      .findOne({
        userId: new Types.ObjectId(userId),
        bookId: new Types.ObjectId(bookId),
      })
      .select('status')
      .lean()
      .exec();
    return { inLibrary: !!item, status: item?.status ?? null };
  }

  async remove(userId: string, bookId: string) {
    const result = await this.libraryItemModel
      .findOneAndDelete({
        userId: new Types.ObjectId(userId),
        bookId: new Types.ObjectId(bookId),
      })
      .exec();
    if (!result) throw new NotFoundException('Not in library');
    return { deleted: true };
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.libraryItemModel
        .find()
        .populate('userId', 'email name')
        .populate('bookId', 'title slug author')
        .sort({ addedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.libraryItemModel.countDocuments().exec(),
    ]);
    return { items, total, page, limit };
  }
}

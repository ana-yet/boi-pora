import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { LibraryItem, LibraryItemDocument } from '../../schemas/library-item.schema';
import { LibraryItemStatus } from '../../common/enums';

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
        userId: uid, bookId: bid, status: 'saved', addedAt: new Date(),
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
      .findOne({ userId: new Types.ObjectId(userId), bookId: new Types.ObjectId(bookId) })
      .select('status')
      .lean()
      .exec();
    return { inLibrary: !!item, status: item?.status ?? null };
  }

  async remove(userId: string, bookId: string) {
    const result = await this.libraryItemModel
      .findOneAndDelete({ userId: new Types.ObjectId(userId), bookId: new Types.ObjectId(bookId) })
      .exec();
    if (!result) throw new NotFoundException('Not in library');
    return { deleted: true };
  }

  async findAll(page = 1, limit = 20, search?: string, status?: string) {
    const skip = (page - 1) * limit;
    const filter: FilterQuery<LibraryItem> = {};
    if (status && Object.values(LibraryItemStatus).includes(status as LibraryItemStatus)) {
      filter.status = status;
    }

    let items = await this.libraryItemModel
      .find(filter)
      .populate('userId', 'email name')
      .populate('bookId', 'title slug author')
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();

    if (search?.trim()) {
      const lc = search.trim().toLowerCase();
      items = items.filter((item: Record<string, unknown>) => {
        const u = item.userId as { email?: string; name?: string } | undefined;
        const b = item.bookId as { title?: string; author?: string } | undefined;
        return (
          u?.email?.toLowerCase().includes(lc) ||
          u?.name?.toLowerCase().includes(lc) ||
          b?.title?.toLowerCase().includes(lc) ||
          b?.author?.toLowerCase().includes(lc)
        );
      });
    }

    const total = await this.libraryItemModel.countDocuments(filter).exec();
    return { items, total, page, limit };
  }

  async adminUpdateStatus(id: string, status: string) {
    if (!Object.values(LibraryItemStatus).includes(status as LibraryItemStatus)) {
      throw new BadRequestException('Invalid status');
    }
    const item = await this.libraryItemModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true, lean: true })
      .exec();
    if (!item) throw new NotFoundException('Library item not found');
    return item;
  }

  async adminRemove(id: string) {
    const result = await this.libraryItemModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Library item not found');
    return { deleted: true };
  }
}

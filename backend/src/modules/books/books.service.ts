import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { Book, BookDocument } from '../../schemas/book.schema';
import { BookStatus } from '../../common/enums';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private sortSpec(sort?: string): Record<string, 1 | -1> {
    switch (sort) {
      case 'rating':
      case 'ratingCount':
        return { [sort]: -1 };
      case 'createdAt':
        return { createdAt: -1 };
      case 'oldest':
        return { createdAt: 1 };
      case 'title_desc':
        return { title: -1 };
      case 'title_asc':
      default:
        return { title: 1 };
    }
  }

  /**
   * Public listing: always restricted to published books.
   * Client-supplied status is intentionally ignored.
   */
  async findAll(
    page = 1,
    limit = 20,
    category?: string,
    sort?: string,
    search?: string,
  ) {
    limit = Math.min(limit, 100);
    const filter: FilterQuery<Book> = { status: BookStatus.PUBLISHED };
    if (category) filter.category = category;
    if (search?.trim()) {
      const regex = new RegExp(this.escapeRegex(search.trim()), 'i');
      filter.$or = [{ title: regex }, { author: regex }];
    }
    return this.paginate(filter, page, limit, this.sortSpec(sort));
  }

  /** Admin listing: full status filter (or all statuses when unset). */
  async findAllAdmin(
    page = 1,
    limit = 20,
    category?: string,
    status?: string,
    sort?: string,
    search?: string,
  ) {
    limit = Math.min(limit, 100);
    const filter: FilterQuery<Book> = {};
    if (category) filter.category = category;
    if (status && Object.values(BookStatus).includes(status as BookStatus)) {
      filter.status = status;
    }
    if (search?.trim()) {
      const regex = new RegExp(this.escapeRegex(search.trim()), 'i');
      filter.$or = [{ title: regex }, { author: regex }];
    }
    return this.paginate(filter, page, limit, this.sortSpec(sort));
  }

  private async paginate(
    filter: FilterQuery<Book>,
    page: number,
    limit: number,
    sortSpec: Record<string, 1 | -1>,
  ) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.bookModel
        .find(filter)
        .sort(sortSpec)
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      this.bookModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async search(q: string, limit = 20) {
    limit = Math.min(limit, 100);
    const published = { status: BookStatus.PUBLISHED };
    if (!q || q.trim().length === 0) {
      return this.bookModel
        .find(published)
        .sort({ title: 1 })
        .limit(limit)
        .lean()
        .exec();
    }
    const trimmed = q.trim();
    if (trimmed.includes(' ') || trimmed.length >= 3) {
      const textResults = await this.bookModel
        .find(
          { $text: { $search: trimmed }, ...published },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean()
        .exec();
      if (textResults.length > 0) return textResults;
    }
    const escaped = this.escapeRegex(trimmed);
    const regex = new RegExp(escaped, 'i');
    return this.bookModel
      .find({ $or: [{ title: regex }, { author: regex }], ...published })
      .limit(limit)
      .lean()
      .exec();
  }

  async findOne(id: string, includeUnpublished = false) {
    const book = await this.bookModel.findById(id).lean().exec();
    if (!book) throw new NotFoundException('Book not found');
    if (!includeUnpublished && book.status !== BookStatus.PUBLISHED) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async findBySlug(slug: string, includeUnpublished = false) {
    const book = await this.bookModel.findOne({ slug }).lean().exec();
    if (!book) throw new NotFoundException('Book not found');
    if (!includeUnpublished && book.status !== BookStatus.PUBLISHED) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async create(dto: CreateBookDto) {
    try {
      return await this.bookModel.create(dto);
    } catch (err: unknown) {
      if (
        err &&
        typeof err === 'object' &&
        'code' in err &&
        (err as { code: number }).code === 11000
      ) {
        throw new ConflictException('Book with this slug already exists');
      }
      throw err;
    }
  }

  async update(id: string, dto: UpdateBookDto) {
    if (dto.slug) {
      const conflict = await this.bookModel
        .findOne({ slug: dto.slug, _id: { $ne: id } })
        .select('_id')
        .lean()
        .exec();
      if (conflict)
        throw new ConflictException('Book with this slug already exists');
    }
    const book = await this.bookModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, lean: true })
      .exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async updateStatus(id: string, status: string) {
    if (!Object.values(BookStatus).includes(status as BookStatus)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    const book = await this.bookModel
      .findByIdAndUpdate(id, { $set: { status } }, { new: true, lean: true })
      .exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async remove(id: string) {
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Book not found');
    return { deleted: true };
  }

  async bulkAction(action: string, ids: string[]) {
    if (!ids.length) return { affected: 0 };
    if (action === 'delete') {
      const result = await this.bookModel
        .deleteMany({ _id: { $in: ids } })
        .exec();
      return { affected: result.deletedCount };
    }
    if (action === 'publish') {
      const result = await this.bookModel
        .updateMany(
          { _id: { $in: ids } },
          { $set: { status: BookStatus.PUBLISHED } },
        )
        .exec();
      return { affected: result.modifiedCount };
    }
    if (action === 'archive') {
      const result = await this.bookModel
        .updateMany(
          { _id: { $in: ids } },
          { $set: { status: BookStatus.ARCHIVED } },
        )
        .exec();
      return { affected: result.modifiedCount };
    }
    return { affected: 0 };
  }
}

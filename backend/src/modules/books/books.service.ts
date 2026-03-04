import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Book, BookDocument } from '../../schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(@InjectModel(Book.name) private bookModel: Model<BookDocument>) {}

  async findAll(
    page = 1,
    limit = 20,
    category?: string,
    status?: string,
    sort?: string,
  ) {
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (status) filter.status = status;
    const skip = (page - 1) * limit;

    let sortSpec: Record<string, 1 | -1>;
    if (sort === 'rating' || sort === 'ratingCount') {
      sortSpec = { [sort]: -1 };
    } else if (sort === 'createdAt') {
      sortSpec = { createdAt: -1 };
    } else {
      sortSpec = { title: 1 };
    }

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
    if (!q || q.trim().length === 0) {
      return this.bookModel.find().sort({ title: 1 }).limit(limit).lean().exec();
    }

    const trimmed = q.trim();

    // Use text index for multi-word queries (faster, scored)
    if (trimmed.includes(' ') || trimmed.length >= 3) {
      const textResults = await this.bookModel
        .find(
          { $text: { $search: trimmed } },
          { score: { $meta: 'textScore' } },
        )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit)
        .lean()
        .exec();
      if (textResults.length > 0) return textResults;
    }

    // Fallback to regex for short queries or when text search yields nothing
    const regex = new RegExp(trimmed, 'i');
    return this.bookModel
      .find({
        $or: [
          { title: regex },
          { author: regex },
        ],
      })
      .limit(limit)
      .lean()
      .exec();
  }

  async findOne(id: string) {
    const book = await this.bookModel.findById(id).lean().exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async findBySlug(slug: string) {
    const book = await this.bookModel.findOne({ slug }).lean().exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async create(dto: CreateBookDto) {
    try {
      return await this.bookModel.create(dto);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
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
      if (conflict) throw new ConflictException('Book with this slug already exists');
    }

    const book = await this.bookModel
      .findByIdAndUpdate(id, { $set: dto }, { new: true, lean: true })
      .exec();
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  async remove(id: string) {
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) throw new NotFoundException('Book not found');
    return { deleted: true };
  }
}

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
    let query = this.bookModel.find(filter);
    if (sort === 'rating' || sort === 'ratingCount') {
      query = query.sort({ [sort]: -1 });
    } else if (sort === 'createdAt') {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ title: 1 });
    }
    const [items, total] = await Promise.all([
      query.skip(skip).limit(limit).lean().exec(),
      this.bookModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async search(q: string, limit = 20) {
    if (!q || q.trim().length === 0) {
      return this.bookModel.find().limit(limit).sort({ title: 1 }).lean().exec();
    }
    const regex = new RegExp(q.trim(), 'i');
    return this.bookModel
      .find({
        $or: [
          { title: regex },
          { author: regex },
          { description: regex },
        ],
      })
      .limit(limit)
      .lean()
      .exec();
  }

  async findOne(id: string) {
    const book = await this.bookModel.findById(id).lean().exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async findBySlug(slug: string) {
    const book = await this.bookModel.findOne({ slug }).lean().exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    return book;
  }

  async create(dto: CreateBookDto) {
    const existing = await this.bookModel.findOne({ slug: dto.slug }).exec();
    if (existing) {
      throw new ConflictException('Book with this slug already exists');
    }
    return this.bookModel.create(dto);
  }

  async update(id: string, dto: UpdateBookDto) {
    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }
    if (dto.slug && dto.slug !== book.slug) {
      const existing = await this.bookModel.findOne({ slug: dto.slug }).exec();
      if (existing) {
        throw new ConflictException('Book with this slug already exists');
      }
    }
    Object.assign(book, dto);
    await book.save();
    return book.toObject();
  }

  async remove(id: string) {
    const result = await this.bookModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Book not found');
    }
    return { deleted: true };
  }
}

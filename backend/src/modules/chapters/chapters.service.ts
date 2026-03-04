import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Chapter, ChapterDocument } from '../../schemas/chapter.schema';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';

@Injectable()
export class ChaptersService {
  constructor(@InjectModel(Chapter.name) private chapterModel: Model<ChapterDocument>) {}

  async findByBook(bookId: string) {
    return this.chapterModel
      .find({ bookId: new Types.ObjectId(bookId) })
      .sort({ order: 1, chapterNumber: 1 })
      .lean()
      .exec();
  }

  async findOne(id: string) {
    const chapter = await this.chapterModel.findById(id).lean().exec();
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return chapter;
  }

  async findByBookAndChapterId(bookId: string, chapterId: string) {
    const chapter = await this.chapterModel
      .findOne({ bookId: new Types.ObjectId(bookId), chapterId })
      .lean()
      .exec();
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    return chapter;
  }

  async create(dto: CreateChapterDto) {
    const bookId = new Types.ObjectId(dto.bookId);
    const existing = await this.chapterModel
      .findOne({ bookId, chapterId: dto.chapterId })
      .exec();
    if (existing) {
      throw new ConflictException('Chapter with this ID already exists for this book');
    }
    return this.chapterModel.create({
      ...dto,
      bookId,
    });
  }

  async update(id: string, dto: UpdateChapterDto) {
    const chapter = await this.chapterModel.findById(id).exec();
    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }
    if (dto.chapterId && dto.chapterId !== chapter.chapterId) {
      const existing = await this.chapterModel
        .findOne({ bookId: chapter.bookId, chapterId: dto.chapterId })
        .exec();
      if (existing) {
        throw new ConflictException('Chapter with this ID already exists for this book');
      }
    }
    const updates = Object.fromEntries(
      Object.entries(dto).filter(([, v]) => v !== undefined),
    );
    Object.assign(chapter, updates);
    await chapter.save();
    return chapter.toObject();
  }

  async remove(id: string) {
    const result = await this.chapterModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('Chapter not found');
    }
    return { deleted: true };
  }
}

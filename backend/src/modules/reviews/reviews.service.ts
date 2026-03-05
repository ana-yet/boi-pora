import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../../schemas/review.schema';
import { Book, BookDocument } from '../../schemas/book.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  async findByBook(bookId: string, page = 1, limit = 20) {
    const bid = new Types.ObjectId(bookId);
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.reviewModel
        .find({ bookId: bid, isPublic: true })
        .populate('userId', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.reviewModel.countDocuments({ bookId: bid, isPublic: true }).exec(),
    ]);
    return { items, total, page, limit };
  }

  async create(userId: string, bookId: string, rating: number, content?: string) {
    const uid = new Types.ObjectId(userId);
    const bid = new Types.ObjectId(bookId);
    const existing = await this.reviewModel.findOne({ userId: uid, bookId: bid }).exec();
    if (existing) throw new ConflictException('Already reviewed');
    const review = await this.reviewModel.create({
      userId: uid,
      bookId: bid,
      rating,
      content,
    });
    await this.recalculateBookRating(bid);
    return review;
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Review not found');
    const uid = review.userId.toString();
    if (!isAdmin && uid !== userId) throw new ForbiddenException('Not authorized to delete this review');
    await this.reviewModel.findByIdAndDelete(id).exec();
    await this.recalculateBookRating(review.bookId);
    return { deleted: true };
  }

  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.reviewModel
        .find()
        .populate('userId', 'email name')
        .populate('bookId', 'title slug author')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.reviewModel.countDocuments().exec(),
    ]);
    return { items, total, page, limit };
  }

  private async recalculateBookRating(bookId: Types.ObjectId) {
    const result = await this.reviewModel.aggregate([
      { $match: { bookId } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    const rating = result.length > 0 ? Math.round(result[0].avgRating * 10) / 10 : 0;
    const ratingCount = result.length > 0 ? result[0].count : 0;
    await this.bookModel.findByIdAndUpdate(bookId, { $set: { rating, ratingCount } }).exec();
  }
}

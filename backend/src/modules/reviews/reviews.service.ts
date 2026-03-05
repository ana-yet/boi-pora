import { Injectable, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types, FilterQuery } from 'mongoose';
import { Review, ReviewDocument } from '../../schemas/review.schema';
import { Book, BookDocument } from '../../schemas/book.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(Book.name) private bookModel: Model<BookDocument>,
  ) {}

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

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
    const review = await this.reviewModel.create({ userId: uid, bookId: bid, rating, content });
    await this.recalculateBookRating(bid);
    return review;
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Review not found');
    if (!isAdmin && review.userId.toString() !== userId) {
      throw new ForbiddenException('Not authorized to delete this review');
    }
    await this.reviewModel.findByIdAndDelete(id).exec();
    await this.recalculateBookRating(review.bookId);
    return { deleted: true };
  }

  async findAll(page = 1, limit = 20, search?: string, rating?: number, flagged?: string) {
    const skip = (page - 1) * limit;
    const filter: FilterQuery<Review> = {};

    if (flagged === 'true') filter.flagged = true;
    if (rating && rating >= 1 && rating <= 5) filter.rating = rating;

    if (search?.trim()) {
      const regex = new RegExp(this.escapeRegex(search.trim()), 'i');
      filter.$or = [{ content: regex }];
    }

    const [items, total] = await Promise.all([
      this.reviewModel.find(filter)
        .populate('userId', 'email name')
        .populate('bookId', 'title slug author')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .lean()
        .exec(),
      this.reviewModel.countDocuments(filter).exec(),
    ]);
    return { items, total, page, limit };
  }

  async adminDelete(id: string) {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Review not found');
    await this.reviewModel.findByIdAndDelete(id).exec();
    await this.recalculateBookRating(review.bookId);
    return { deleted: true };
  }

  async flag(id: string, flagged: boolean) {
    const review = await this.reviewModel
      .findByIdAndUpdate(id, { $set: { flagged } }, { new: true, lean: true })
      .exec();
    if (!review) throw new NotFoundException('Review not found');
    return review;
  }

  async bulkAction(action: string, ids: string[]) {
    if (!ids.length) return { affected: 0 };
    if (action === 'delete') {
      const reviews = await this.reviewModel.find({ _id: { $in: ids } }).lean().exec();
      const result = await this.reviewModel.deleteMany({ _id: { $in: ids } }).exec();
      const bookIds = [...new Set(reviews.map(r => r.bookId.toString()))];
      await Promise.all(bookIds.map(bid => this.recalculateBookRating(new Types.ObjectId(bid))));
      return { affected: result.deletedCount };
    }
    if (action === 'flag') {
      const result = await this.reviewModel.updateMany(
        { _id: { $in: ids } },
        { $set: { flagged: true } },
      ).exec();
      return { affected: result.modifiedCount };
    }
    return { affected: 0 };
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

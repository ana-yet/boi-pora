import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Review, ReviewDocument } from '../../schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(@InjectModel(Review.name) private reviewModel: Model<ReviewDocument>) {}

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
    return this.reviewModel.create({
      userId: uid,
      bookId: bid,
      rating,
      content,
    });
  }

  async remove(id: string, userId: string, isAdmin: boolean) {
    const review = await this.reviewModel.findById(id).exec();
    if (!review) throw new NotFoundException('Review not found');
    const uid = review.userId.toString();
    if (!isAdmin && uid !== userId) throw new NotFoundException('Not authorized');
    await this.reviewModel.findByIdAndDelete(id).exec();
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
}

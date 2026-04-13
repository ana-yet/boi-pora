import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../../schemas/user.schema';
import { Book } from '../../schemas/book.schema';
import { Chapter } from '../../schemas/chapter.schema';
import { LibraryItem } from '../../schemas/library-item.schema';
import { Review } from '../../schemas/review.schema';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Book.name) private bookModel: Model<Book>,
    @InjectModel(Chapter.name) private chapterModel: Model<Chapter>,
    @InjectModel(LibraryItem.name) private libraryItemModel: Model<LibraryItem>,
    @InjectModel(Review.name) private reviewModel: Model<Review>,
  ) {}

  async getStats() {
    const [users, books, chapters, libraryItems, reviews] = await Promise.all([
      this.userModel.countDocuments().exec(),
      this.bookModel.countDocuments().exec(),
      this.chapterModel.countDocuments().exec(),
      this.libraryItemModel.countDocuments().exec(),
      this.reviewModel.countDocuments().exec(),
    ]);
    return { users, books, chapters, libraryItems, reviews };
  }

  async getAnalytics(metric: string, range: string) {
    const days = this.parseDays(range);
    const since = new Date();
    since.setDate(since.getDate() - days);

    switch (metric) {
      case 'newUsers':
        return this.timeSeriesAggregation(
          this.userModel,
          'createdAt',
          since,
          days,
        );
      case 'newBooks':
        return this.timeSeriesAggregation(
          this.bookModel,
          'createdAt',
          since,
          days,
        );
      case 'newReviews':
        return this.timeSeriesAggregation(
          this.reviewModel,
          'createdAt',
          since,
          days,
        );
      case 'libraryAdds':
        return this.timeSeriesAggregation(
          this.libraryItemModel,
          'addedAt',
          since,
          days,
        );
      default:
        return [];
    }
  }

  async getRecentActivity(limit = 20) {
    const [users, books, reviews] = await Promise.all([
      this.userModel
        .find()
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 3))
        .select('name email createdAt')
        .lean()
        .exec(),
      this.bookModel
        .find()
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 3))
        .select('title author createdAt')
        .lean()
        .exec(),
      this.reviewModel
        .find()
        .sort({ createdAt: -1 })
        .limit(Math.ceil(limit / 3))
        .populate('userId', 'name email')
        .populate('bookId', 'title')
        .select('rating createdAt')
        .lean()
        .exec(),
    ]);

    const events: Array<{
      type: string;
      description: string;
      timestamp: string;
    }> = [];

    for (const u of users) {
      const doc = u as unknown as {
        name?: string;
        email: string;
        createdAt?: Date;
      };
      events.push({
        type: 'signup',
        description: `${doc.name || doc.email} signed up`,
        timestamp: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      });
    }
    for (const b of books) {
      const doc = b as unknown as {
        title: string;
        author: string;
        createdAt?: Date;
      };
      events.push({
        type: 'book',
        description: `"${doc.title}" by ${doc.author} was added`,
        timestamp: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      });
    }
    for (const r of reviews) {
      const doc = r as unknown as {
        userId?: { name?: string; email?: string };
        bookId?: { title?: string };
        rating: number;
        createdAt?: Date;
      };
      events.push({
        type: 'review',
        description: `${doc.userId?.name || doc.userId?.email || 'Someone'} reviewed "${doc.bookId?.title || 'a book'}" (${doc.rating}★)`,
        timestamp: doc.createdAt?.toISOString() ?? new Date().toISOString(),
      });
    }

    return events
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, limit);
  }

  private parseDays(range: string): number {
    const map: Record<string, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365,
    };
    return map[range] ?? 30;
  }

  private async timeSeriesAggregation(
    model: Model<unknown>,
    dateField: string,
    since: Date,
    days: number,
  ): Promise<Array<{ date: string; count: number }>> {
    const groupByFormat = days <= 30 ? '%Y-%m-%d' : '%Y-%m';
    const raw: unknown = await model.aggregate([
      { $match: { [dateField]: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: groupByFormat, date: `$${dateField}` },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { _id: 0, date: '$_id', count: 1 } },
    ]);
    if (!Array.isArray(raw)) {
      return [];
    }
    return raw.map((row) => {
      const r = row as Record<string, unknown>;
      return {
        date: String(r['date']),
        count: Number(r['count']),
      };
    });
  }
}

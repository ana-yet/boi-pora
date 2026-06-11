import { Test } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ReviewsService } from './reviews.service';
import { Review } from '../../schemas/review.schema';
import { Book } from '../../schemas/book.schema';

describe('ReviewsService — recalculateBookRating', () => {
  let service: ReviewsService;
  let reviewModel: {
    aggregate: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
  };
  let bookModel: { findByIdAndUpdate: jest.Mock };
  const bookId = new Types.ObjectId();
  const userId = new Types.ObjectId().toString();

  beforeEach(async () => {
    reviewModel = {
      aggregate: jest.fn().mockResolvedValue([]),
      findOne: jest.fn(() => ({ exec: () => Promise.resolve(null) })),
      create: jest.fn().mockResolvedValue({ rating: 4 }),
    };
    bookModel = {
      findByIdAndUpdate: jest.fn(() => ({
        exec: () => Promise.resolve(null),
      })),
    };
    const moduleRef = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: getModelToken(Review.name), useValue: reviewModel },
        { provide: getModelToken(Book.name), useValue: bookModel },
      ],
    }).compile();
    service = moduleRef.get(ReviewsService);
  });

  async function triggerRecalculate() {
    // create() is the public path that ends in recalculateBookRating.
    await service.create(userId, bookId.toString(), 4, 'nice');
  }

  it('aggregates only public reviews', async () => {
    await triggerRecalculate();
    const pipeline = reviewModel.aggregate.mock.calls[0][0];
    const match = pipeline.find(
      (stage: Record<string, unknown>) => '$match' in stage,
    );
    expect(match.$match.isPublic).toBe(true);
  });

  it('rounds the average to 1 decimal place', async () => {
    reviewModel.aggregate.mockResolvedValue([
      { _id: null, avgRating: 4.4444, count: 9 },
    ]);
    await triggerRecalculate();
    expect(bookModel.findByIdAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      { $set: { rating: 4.4, ratingCount: 9 } },
    );
  });

  it('writes rating 0 when there are no reviews', async () => {
    reviewModel.aggregate.mockResolvedValue([]);
    await triggerRecalculate();
    expect(bookModel.findByIdAndUpdate).toHaveBeenCalledWith(
      expect.anything(),
      { $set: { rating: 0, ratingCount: 0 } },
    );
  });

  it('rejects a second review from the same user', async () => {
    reviewModel.findOne = jest.fn(() => ({
      exec: () => Promise.resolve({ _id: 'existing' }),
    }));
    await expect(service.create(userId, bookId.toString(), 5)).rejects.toThrow(
      'Already reviewed',
    );
  });
});

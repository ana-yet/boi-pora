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
    const [usersCount, booksCount, chaptersCount, libraryItemsCount, reviewsCount] =
      await Promise.all([
        this.userModel.countDocuments().exec(),
        this.bookModel.countDocuments().exec(),
        this.chapterModel.countDocuments().exec(),
        this.libraryItemModel.countDocuments().exec(),
        this.reviewModel.countDocuments().exec(),
      ]);
    return {
      users: usersCount,
      books: booksCount,
      chapters: chaptersCount,
      libraryItems: libraryItemsCount,
      reviews: reviewsCount,
    };
  }
}

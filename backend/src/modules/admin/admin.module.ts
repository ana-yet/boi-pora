import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { User, UserSchema } from '../../schemas/user.schema';
import { Book, BookSchema } from '../../schemas/book.schema';
import { Chapter, ChapterSchema } from '../../schemas/chapter.schema';
import { LibraryItem, LibraryItemSchema } from '../../schemas/library-item.schema';
import { Review, ReviewSchema } from '../../schemas/review.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Book.name, schema: BookSchema },
      { name: Chapter.name, schema: ChapterSchema },
      { name: LibraryItem.name, schema: LibraryItemSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}

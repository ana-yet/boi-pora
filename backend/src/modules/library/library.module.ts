import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  LibraryController,
  AdminLibraryController,
} from './library.controller';
import { LibraryService } from './library.service';
import {
  LibraryItem,
  LibraryItemSchema,
} from '../../schemas/library-item.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LibraryItem.name, schema: LibraryItemSchema },
    ]),
  ],
  controllers: [LibraryController, AdminLibraryController],
  providers: [LibraryService],
})
export class LibraryModule {}

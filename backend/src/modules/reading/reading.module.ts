import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ReadingController } from './reading.controller';
import { ReadingService } from './reading.service';
import { ReadingProgress, ReadingProgressSchema } from '../../schemas/reading-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ReadingProgress.name, schema: ReadingProgressSchema },
    ]),
  ],
  controllers: [ReadingController],
  providers: [ReadingService],
})
export class ReadingModule {}

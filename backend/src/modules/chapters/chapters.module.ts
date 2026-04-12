import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';
import { ChapterSummaryService } from './chapter-summary.service';
import { Chapter, ChapterSchema } from '../../schemas/chapter.schema';
import {
  ChapterAiSummary,
  ChapterAiSummarySchema,
} from '../../schemas/chapter-ai-summary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chapter.name, schema: ChapterSchema },
      { name: ChapterAiSummary.name, schema: ChapterAiSummarySchema },
    ]),
  ],
  controllers: [ChaptersController],
  providers: [ChaptersService, ChapterSummaryService],
  exports: [ChaptersService, ChapterSummaryService],
})
export class ChaptersModule {}

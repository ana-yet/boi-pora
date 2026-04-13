import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ReadingService } from './reading.service';
import { UpsertProgressDto } from './dto/upsert-progress.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/v1/reading/progress')
@UseGuards(JwtAuthGuard)
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get()
  findByUser(
    @CurrentUser('sub') userId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = Math.min(parseInt(limit ?? '50', 10) || 50, 100);
    return this.readingService.findByUser(userId, parsedLimit);
  }

  @Post()
  upsert(@CurrentUser('sub') userId: string, @Body() dto: UpsertProgressDto) {
    return this.readingService.upsert(userId, dto.bookId, {
      chapterId: dto.chapterId,
      percentComplete: dto.percentComplete,
    });
  }

  @Put()
  update(@CurrentUser('sub') userId: string, @Body() dto: UpsertProgressDto) {
    return this.readingService.upsert(userId, dto.bookId, {
      chapterId: dto.chapterId,
      percentComplete: dto.percentComplete,
    });
  }
}

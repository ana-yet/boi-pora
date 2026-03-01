import { Controller, Get, Post, Put, Body, UseGuards } from '@nestjs/common';
import { ReadingService } from './reading.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/v1/reading/progress')
@UseGuards(JwtAuthGuard)
export class ReadingController {
  constructor(private readonly readingService: ReadingService) {}

  @Get()
  findByUser(@CurrentUser('sub') userId: string) {
    return this.readingService.findByUser(userId);
  }

  @Post()
  upsert(
    @CurrentUser('sub') userId: string,
    @Body() body: { bookId: string; chapterId?: string; percentComplete?: number },
  ) {
    return this.readingService.upsert(userId, body.bookId, {
      chapterId: body.chapterId,
      percentComplete: body.percentComplete,
    });
  }

  @Put()
  update(
    @CurrentUser('sub') userId: string,
    @Body() body: { bookId: string; chapterId?: string; percentComplete?: number },
  ) {
    return this.readingService.upsert(userId, body.bookId, {
      chapterId: body.chapterId,
      percentComplete: body.percentComplete,
    });
  }
}

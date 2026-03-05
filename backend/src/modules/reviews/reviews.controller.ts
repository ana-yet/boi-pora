import { Controller, Get, Post, Patch, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole } from '../../common/enums';

@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get()
  findByBook(
    @Query('bookId') bookId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    if (!bookId) return { items: [], total: 0, page: 1, limit: 20 };
    const parsedLimit = Math.min(parseInt(limit ?? '20', 10) || 20, 100);
    return this.reviewsService.findByBook(bookId, parseInt(page ?? '1', 10) || 1, parsedLimit);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser('sub') userId: string, @Body() dto: CreateReviewDto) {
    return this.reviewsService.create(userId, dto.bookId, dto.rating, dto.content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.reviewsService.remove(id, userId, role === UserRole.ADMIN);
  }
}

@Controller('api/v1/admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('rating') rating?: string,
    @Query('flagged') flagged?: string,
  ) {
    const parsedLimit = Math.min(parseInt(limit ?? '20', 10) || 20, 100);
    return this.reviewsService.findAll(
      parseInt(page ?? '1', 10) || 1,
      parsedLimit,
      search,
      rating ? parseInt(rating, 10) : undefined,
      flagged,
    );
  }

  @Patch(':id/flag')
  flag(@Param('id') id: string, @Body() body: { flagged: boolean }) {
    return this.reviewsService.flag(id, body.flagged ?? true);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.adminDelete(id);
  }

  @Post('bulk')
  bulk(@Body() body: { action: string; ids: string[] }) {
    return this.reviewsService.bulkAction(body.action, body.ids ?? []);
  }
}

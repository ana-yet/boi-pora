import { Controller, Get, Post, Delete, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';

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
    return this.reviewsService.findByBook(
      bookId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @CurrentUser('sub') userId: string,
    @Body() body: { bookId: string; rating: number; content?: string },
  ) {
    return this.reviewsService.create(
      userId,
      body.bookId,
      body.rating,
      body.content,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @CurrentUser('role') role: string,
  ) {
    return this.reviewsService.remove(id, userId, role === 'admin');
  }
}

@Controller('api/v1/admin/reviews')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.reviewsService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}

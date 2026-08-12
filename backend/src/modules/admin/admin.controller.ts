import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { AdminService } from './admin.service';
import { BooksService } from '../books/books.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole } from '../../common/enums';

@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly booksService: BooksService,
  ) {}

  @Get('books')
  listBooks(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: string,
    @Query('search') search?: string,
  ) {
    const parsedLimit = Math.min(parseInt(limit ?? '20', 10) || 20, 100);
    return this.booksService.findAllAdmin(
      parseInt(page ?? '1', 10) || 1,
      parsedLimit,
      category,
      status,
      sort,
      search,
    );
  }

  @Get('books/:id')
  getBook(@Param('id') id: string) {
    return this.booksService.findOne(id, true);
  }

  @Get('stats')
  getStats() {
    return this.adminService.getStats();
  }

  @Get('analytics')
  getAnalytics(
    @Query('metric') metric?: string,
    @Query('range') range?: string,
  ) {
    return this.adminService.getAnalytics(metric ?? 'newUsers', range ?? '30d');
  }

  @Get('activity')
  getRecentActivity(@Query('limit') limit?: string) {
    return this.adminService.getRecentActivity(
      Math.min(parseInt(limit ?? '20', 10) || 20, 50),
    );
  }
}

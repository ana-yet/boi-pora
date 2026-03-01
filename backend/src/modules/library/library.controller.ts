import { Controller, Get, Post, Delete, Param, Query, UseGuards } from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('api/v1/library')
@UseGuards(JwtAuthGuard)
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  findByUser(
    @CurrentUser('sub') userId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.libraryService.findByUser(
      userId,
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post(':bookId')
  add(@CurrentUser('sub') userId: string, @Param('bookId') bookId: string) {
    return this.libraryService.add(userId, bookId);
  }

  @Delete(':bookId')
  remove(@CurrentUser('sub') userId: string, @Param('bookId') bookId: string) {
    return this.libraryService.remove(userId, bookId);
  }
}

@Controller('api/v1/admin/library')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminLibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  findAll(@Query('page') page?: string, @Query('limit') limit?: string) {
    return this.libraryService.findAll(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 20,
    );
  }
}

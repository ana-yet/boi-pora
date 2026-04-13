import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { LibraryService } from './library.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums';

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
    const parsedLimit = Math.min(parseInt(limit ?? '20', 10) || 20, 100);
    return this.libraryService.findByUser(
      userId,
      parseInt(page ?? '1', 10) || 1,
      parsedLimit,
    );
  }

  @Post(':bookId')
  add(@CurrentUser('sub') userId: string, @Param('bookId') bookId: string) {
    return this.libraryService.add(userId, bookId);
  }

  @Get('status/:bookId')
  checkStatus(
    @CurrentUser('sub') userId: string,
    @Param('bookId') bookId: string,
  ) {
    return this.libraryService.checkStatus(userId, bookId);
  }

  @Delete(':bookId')
  remove(@CurrentUser('sub') userId: string, @Param('bookId') bookId: string) {
    return this.libraryService.remove(userId, bookId);
  }
}

@Controller('api/v1/admin/library')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
export class AdminLibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    const parsedLimit = Math.min(parseInt(limit ?? '20', 10) || 20, 100);
    return this.libraryService.findAll(
      parseInt(page ?? '1', 10) || 1,
      parsedLimit,
      search,
      status,
    );
  }

  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Query('status') status: string) {
    return this.libraryService.adminUpdateStatus(id, status);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.libraryService.adminRemove(id);
  }
}

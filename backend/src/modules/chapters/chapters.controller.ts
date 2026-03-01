import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ChaptersService } from './chapters.service';
import { CreateChapterDto } from './dto/create-chapter.dto';
import { UpdateChapterDto } from './dto/update-chapter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';

@Controller('api/v1/chapters')
export class ChaptersController {
  constructor(private readonly chaptersService: ChaptersService) {}

  @Public()
  @Get('book/:bookId')
  findByBook(@Param('bookId') bookId: string) {
    return this.chaptersService.findByBook(bookId);
  }

  @Public()
  @Get('book/:bookId/:chapterId')
  findByBookAndChapterId(
    @Param('bookId') bookId: string,
    @Param('chapterId') chapterId: string,
  ) {
    return this.chaptersService.findByBookAndChapterId(bookId, chapterId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chaptersService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateChapterDto) {
    return this.chaptersService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateChapterDto) {
    return this.chaptersService.update(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chaptersService.remove(id);
  }
}

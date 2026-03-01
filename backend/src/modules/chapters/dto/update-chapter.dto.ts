import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateChapterDto {
  @IsOptional()
  @IsNumber()
  chapterNumber?: number;

  @IsOptional()
  @IsString()
  chapterId?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsNumber()
  wordCount?: number;

  @IsOptional()
  @IsNumber()
  order?: number;
}

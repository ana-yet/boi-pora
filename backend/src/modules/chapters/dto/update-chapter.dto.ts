import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateChapterDto {
  @IsOptional()
  @IsNumber()
  chapterNumber?: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  chapterId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
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

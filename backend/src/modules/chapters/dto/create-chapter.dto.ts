import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  bookId!: string;

  @IsNumber()
  chapterNumber!: number;

  @IsString()
  @IsNotEmpty()
  chapterId!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsOptional()
  @IsNumber()
  wordCount?: number;

  @IsOptional()
  @IsNumber()
  order?: number;
}

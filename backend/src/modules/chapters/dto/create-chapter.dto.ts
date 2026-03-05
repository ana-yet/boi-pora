import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, IsMongoId } from 'class-validator';

export class CreateChapterDto {
  @IsMongoId()
  bookId!: string;

  @IsNumber()
  chapterNumber!: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  chapterId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500000)
  content!: string;

  @IsOptional()
  @IsNumber()
  wordCount?: number;

  @IsOptional()
  @IsNumber()
  order?: number;
}

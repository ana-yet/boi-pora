import { IsOptional, IsString, IsNumber, IsArray, Min, MaxLength, IsIn } from 'class-validator';
import { BookStatus } from '../../../common/enums';

export class UpdateBookDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  author?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authors?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  pageCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedReadTimeMinutes?: number;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  language?: string;

  @IsOptional()
  @IsIn(Object.values(BookStatus))
  status?: BookStatus;
}

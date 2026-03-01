import { IsOptional, IsString, IsNumber, IsArray, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title!: string;

  @IsString()
  slug!: string;

  @IsString()
  author!: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  authors?: string[];

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  coverImageUrl?: string;

  @IsOptional()
  @IsString()
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
  status?: string;
}

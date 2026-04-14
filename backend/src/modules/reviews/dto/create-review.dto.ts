import {
  IsString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  MaxLength,
  IsMongoId,
} from 'class-validator';

export class CreateReviewDto {
  @IsMongoId()
  bookId: string;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsOptional()
  @IsString()
  @MaxLength(5000)
  content?: string;
}

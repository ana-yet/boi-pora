import { IsMongoId, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpsertProgressDto {
  @IsMongoId()
  bookId: string;

  @IsOptional()
  @IsMongoId()
  chapterId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  percentComplete?: number;
}

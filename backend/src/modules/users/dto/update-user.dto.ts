import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  IsIn,
} from 'class-validator';
import { UserRole } from '../../../common/enums';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  @MaxLength(254)
  email?: string;

  @IsString()
  @MinLength(6)
  @MaxLength(128)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRole;
}

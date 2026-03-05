import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength, MaxLength, IsIn } from 'class-validator';
import { UserRole } from '../../../common/enums';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(254)
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(128)
  password: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsIn(Object.values(UserRole))
  role?: UserRole;
}

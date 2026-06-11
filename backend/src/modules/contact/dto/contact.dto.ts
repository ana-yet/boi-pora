import { IsEmail, IsIn, IsString, Length } from 'class-validator';

export class ContactDto {
  @IsString()
  @Length(1, 100)
  name: string;

  @IsEmail()
  email: string;

  @IsIn(['general', 'bug', 'feature', 'partnership'])
  subject: string;

  @IsString()
  @Length(1, 5000)
  message: string;
}

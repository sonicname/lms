import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsUrl()
  image?: string;

  @IsOptional()
  @IsIn(['admin', 'teacher', 'student'])
  role?: 'admin' | 'teacher' | 'student';
}

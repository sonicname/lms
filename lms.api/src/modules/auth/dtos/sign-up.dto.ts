import {
  IsEmail,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignUpDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsUrl()
  callbackURL?: string;

  @IsString()
  rememberMe?: boolean;

  @IsString()
  @IsUrl()
  image?: string;
}

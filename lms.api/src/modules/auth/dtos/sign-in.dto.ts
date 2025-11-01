import { IsEmail, IsString, IsUrl, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsUrl()
  callbackURL?: string;

  @IsString()
  rememberMe?: boolean;
}

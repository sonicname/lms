import {
  IsBoolean,
  IsEmail,
  IsOptional,
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

  @IsOptional()
  @IsUrl()
  callbackURL?: string;

  @IsOptional()
  @IsBoolean()
  rememberMe?: boolean;

  @IsOptional()
  @IsUrl()
  image?: string;
}

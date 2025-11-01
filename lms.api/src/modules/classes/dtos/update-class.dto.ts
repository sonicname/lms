import { IsOptional, IsString, Length } from 'class-validator';

export class UpdateClassDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @Length(3, 32)
  code?: string;

  // Admin-only
  @IsString()
  @IsOptional()
  teacherId?: string;
}

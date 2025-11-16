import { IsArray, IsOptional, IsString, Length } from 'class-validator';

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

  // Replace tags with the provided list (owned by the class teacher)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];
}

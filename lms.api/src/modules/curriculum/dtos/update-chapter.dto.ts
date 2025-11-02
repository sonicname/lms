import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateChapterDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  content?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  displayOrder?: number;
}

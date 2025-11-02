import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';

export class CreateChapterDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  content?: string | null;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  displayOrder?: number;
}

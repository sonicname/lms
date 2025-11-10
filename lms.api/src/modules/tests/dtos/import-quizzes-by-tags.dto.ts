import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class ImportQuizzesByTagsDto {
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagNames?: string[];

  @IsNumber()
  @IsOptional()
  points?: number | null;

  @IsNumber()
  @IsOptional()
  startOrder?: number | null;
}

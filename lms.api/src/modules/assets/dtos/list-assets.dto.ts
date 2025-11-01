import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class ListAssetsDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  @IsString()
  @IsOptional()
  search?: string; // filename or type contains

  @IsString()
  @IsOptional()
  type?: string; // business type e.g. avatar, lesson-material

  @IsString()
  @IsOptional()
  fileType?: string; // e.g. image, video, pdf

  @IsIn(['createdAt', 'filename', 'fileSize'])
  @IsOptional()
  sortBy?: 'createdAt' | 'filename' | 'fileSize' = 'createdAt';

  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}

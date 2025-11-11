import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAssetsTagDto {
  @ApiProperty({ example: 'slide', description: 'Tag name (per user unique)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name!: string;
}

export class UpdateAssetsTagDto {
  @ApiProperty({ example: 'slides', description: 'New tag name' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(64)
  name!: string;
}

export class ListAssetsTagsDto {
  @ApiPropertyOptional({
    description: 'Filter by tag name (contains, case-insensitive)',
  })
  @IsOptional()
  @IsString()
  search?: string;
}

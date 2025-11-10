import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, Length } from 'class-validator';

export class CreateProfileDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  firstName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  lastName?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 30)
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  @Length(1, 500)
  bio?: string;
}

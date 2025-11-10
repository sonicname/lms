import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class CreateChoiceDto {
  @ApiProperty()
  @IsString()
  @Length(1, 1000)
  content!: string;

  @ApiProperty({ required: false, default: false })
  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean = false;
}

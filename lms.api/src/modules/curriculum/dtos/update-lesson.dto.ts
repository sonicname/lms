import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class UpdateLessonDto {
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

  @ValidateIf((o) => o.scheduleDate !== null && o.scheduleDate !== undefined)
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  scheduleDate?: Date | null;
}

import { Type } from 'class-transformer';
import {
  IsDate,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateLessonDto {
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

  @ValidateIf((o) => o.scheduleDate !== null && o.scheduleDate !== undefined)
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  scheduleDate?: Date | null;
}

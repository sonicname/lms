import { Type } from 'class-transformer';
import {
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

export class CreateTestDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ValidateIf((o) => o.startDate !== null && o.startDate !== undefined)
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  startDate?: Date | null;

  @ValidateIf((o) => o.endDate !== null && o.endDate !== undefined)
  @Type(() => Date)
  @IsDate()
  @IsOptional()
  endDate?: Date | null;
}

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class DateRangeDto {
  @ApiPropertyOptional({
    description: 'Start of range (ISO 8601)',
    type: String,
  })
  @IsOptional()
  @IsDateString()
  from?: string;

  @ApiPropertyOptional({ description: 'End of range (ISO 8601)', type: String })
  @IsOptional()
  @IsDateString()
  to?: string;
}

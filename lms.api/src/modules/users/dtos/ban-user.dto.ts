import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class BanUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  reason?: string;

  @IsOptional()
  @IsDateString()
  until?: string; // ISO date string for ban expiration
}

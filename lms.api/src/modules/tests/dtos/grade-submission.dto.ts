import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GradeSubmissionDto {
  @IsNumber()
  @IsOptional()
  score?: number | null;

  @IsString()
  @IsOptional()
  feedback?: string | null;
}

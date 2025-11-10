import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateEssayQuestionDto {
  @IsString()
  @IsOptional()
  prompt?: string | null;

  @IsNumber()
  @IsOptional()
  displayOrder?: number | null;
}

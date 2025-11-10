import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateEssayQuestionDto {
  @IsString()
  @IsOptional()
  prompt?: string | null;

  @IsNumber()
  @IsOptional()
  displayOrder?: number | null;
}

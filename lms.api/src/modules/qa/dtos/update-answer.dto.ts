import { IsOptional, IsString } from 'class-validator';

export class UpdateAnswerDto {
  @IsString()
  @IsOptional()
  content?: string;
}

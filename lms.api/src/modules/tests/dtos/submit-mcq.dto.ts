import { Type } from 'class-transformer';
import { IsArray, IsString, ValidateNested } from 'class-validator';

class McqAnswerItemDto {
  @IsString()
  quizId!: string;

  @IsString()
  choiceId!: string | null;
}

export class SubmitMcqAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => McqAnswerItemDto)
  answers!: McqAnswerItemDto[];
}

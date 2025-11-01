import { IsString } from 'class-validator';

export class AddStudentDto {
  @IsString()
  studentId!: string;
}

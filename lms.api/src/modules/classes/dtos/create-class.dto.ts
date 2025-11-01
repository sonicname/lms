import { IsNotEmpty, IsOptional, IsString, Length } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 32)
  code!: string;

  // Admin-only: assign a teacher on creation
  @IsString()
  @IsOptional()
  teacherId?: string;
}

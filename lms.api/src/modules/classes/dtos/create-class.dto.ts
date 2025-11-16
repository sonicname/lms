import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

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

  // Optional tag names to associate with the class (owned by the teacher)
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  // Optional banner asset IDs to associate
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  banners?: string[];
}

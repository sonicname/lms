import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Role } from 'src/modules/auth/constants/roles.enum';

export class ListUsersDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 10;

  // Full-text-ish search across name and email
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsIn([Role.Admin, Role.Teacher, Role.Student])
  @IsOptional()
  role?: Role;

  @Transform(({ value }) =>
    value === true || value === 'true' || value === '1'
      ? true
      : value === false || value === 'false' || value === '0'
        ? false
        : undefined,
  )
  @IsBoolean()
  @IsOptional()
  banned?: boolean;

  @IsIn(['createdAt', 'updatedAt', 'email', 'name', 'role'])
  @IsOptional()
  sortBy?: 'createdAt' | 'updatedAt' | 'email' | 'name' | 'role' = 'createdAt';

  @IsIn(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';

  @Transform(({ value }) =>
    value === true || value === 'true' || value === '1'
      ? true
      : value === false || value === 'false' || value === '0'
        ? false
        : undefined,
  )
  @IsBoolean()
  @IsOptional()
  excludeAdmins?: boolean;
}

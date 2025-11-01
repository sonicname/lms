import { SetMetadata } from '@nestjs/common';
import { Role, RoleValue } from 'src/modules/auth/constants/roles.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RoleValue[]) => SetMetadata(ROLES_KEY, roles);

// Handy presets
export const AdminOnly = () => Roles(Role.Admin);
export const TeacherOnly = () => Roles(Role.Teacher);
export const StudentOnly = () => Roles(Role.Student);

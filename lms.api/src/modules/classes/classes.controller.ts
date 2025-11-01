import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Roles } from 'src/modules/auth/constants/roles.decorator';
import { Role } from 'src/modules/auth/constants/roles.enum';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { ClassesService } from './classes.service';
import { AddStudentDocs } from './docs/add-student.docs';
import { ApproveStudentDocs } from './docs/approve-student.docs';
import { CreateClassDocs } from './docs/create-class.docs';
import { DeleteClassDocs } from './docs/delete-class.docs';
import { GetClassDocs } from './docs/get-class.docs';
import { JoinClassDocs } from './docs/join-class.docs';
import { KickStudentDocs } from './docs/kick-student.docs';
import { ListAvailableStudentsDocs } from './docs/list-available-students.docs';
import { ListClassesDocs } from './docs/list-classes.docs';
import { ListMyClassesDocs } from './docs/list-my-classes.docs';
import { ListStudentsDocs } from './docs/list-students.docs';
import { RejectStudentDocs } from './docs/reject-student.docs';
import { UpdateClassDocs } from './docs/update-class.docs';
import { AddStudentDto } from './dtos/add-student.dto';
import { CreateClassDto } from './dtos/create-class.dto';
import { ListAvailableStudentsDto } from './dtos/list-available-students.dto';
import { ListClassStudentsDto } from './dtos/list-class-students.dto';
import { ListClassesDto } from './dtos/list-classes.dto';
import { UpdateClassDto } from './dtos/update-class.dto';

@Controller('classes')
@ApiTags('Classes')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class ClassesController {
  constructor(private readonly classesService: ClassesService) {}

  // Create class: Admin or Teacher
  @Post()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher)
  @CreateClassDocs()
  async create(
    @Req() req: Request & { user?: { id: string } },
    @Body() dto: CreateClassDto,
  ) {
    const actorId = req.user!.id;
    const actorRole = (await this.getRoleFromRequest(req)) as Role;
    return this.classesService.createClass(actorId, actorRole, dto);
  }

  // List classes: Admin sees all, Teacher sees own
  @Get()
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher)
  @ListClassesDocs()
  async list(
    @Req() req: Request & { user?: { id: string } },
    @Query() query: ListClassesDto,
  ) {
    const actorId = req.user!.id;
    const actorRole = (await this.getRoleFromRequest(req)) as Role;
    return this.classesService.listClasses(actorId, actorRole, query);
  }

  // Student: list own approved classes
  @Get('mine')
  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @ListMyClassesDocs()
  async mine(
    @Req() req: Request & { user?: { id: string } },
    @Query() query: ListClassesDto,
  ) {
    return this.classesService.listMyApprovedClasses(req.user!.id, query);
  }

  // Get class detail
  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher)
  @GetClassDocs()
  async getOne(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
  ) {
    const actorId = req.user!.id;
    const actorRole = (await this.getRoleFromRequest(req)) as Role;
    return this.classesService.getClass(actorId, actorRole, id);
  }

  // Update class
  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher)
  @UpdateClassDocs()
  async update(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdateClassDto,
  ) {
    const actorId = req.user!.id;
    const actorRole = (await this.getRoleFromRequest(req)) as Role;
    return this.classesService.updateClass(actorId, actorRole, id, dto);
  }

  // Delete class
  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher)
  @DeleteClassDocs()
  async remove(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') id: string,
  ) {
    const actorId = req.user!.id;
    const actorRole = (await this.getRoleFromRequest(req)) as Role;
    return this.classesService.deleteClass(actorId, actorRole, id);
  }

  // Student: request to join a class
  @Post(':id/join')
  @UseGuards(RolesGuard)
  @Roles(Role.Student)
  @JoinClassDocs()
  async join(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') classId: string,
  ) {
    return this.classesService.studentJoinClass(req.user!.id, classId);
  }

  // Teacher: approve a student request
  @Post(':id/students/:studentId/approve')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @ApproveStudentDocs()
  async approve(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classesService.approveStudent(req.user!.id, classId, studentId);
  }

  // Admin/Teacher: reject a student's join request (pending only)
  @Post(':id/students/:studentId/reject')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher)
  @RejectStudentDocs()
  async reject(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') classId: string,
    @Param('studentId') studentId: string,
  ) {
    const actorId = req.user!.id;
    const actorRole = (await this.getRoleFromRequest(req)) as Role;
    return this.classesService.rejectStudent(
      actorId,
      actorRole,
      classId,
      studentId,
    );
  }

  // Admin/Teacher: list students in a class with optional status filter
  @Get(':id/students')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher)
  @ListStudentsDocs()
  async listStudents(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') classId: string,
    @Query() query: ListClassStudentsDto,
  ) {
    const actorId = req.user!.id;
    const actorRole = (await this.getRoleFromRequest(req)) as Role;
    return this.classesService.listClassStudents(
      actorId,
      actorRole,
      classId,
      query,
    );
  }

  // Admin/Teacher: list available students (not enrolled or requested) for a class
  @Get(':id/available-students')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher)
  @ListAvailableStudentsDocs()
  async listAvailableStudents(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') classId: string,
    @Query() query: ListAvailableStudentsDto,
  ) {
    const actorId = req.user!.id;
    const actorRole = (await this.getRoleFromRequest(req)) as Role;
    return this.classesService.listAvailableStudents(
      actorId,
      actorRole,
      classId,
      query,
    );
  }

  // Teacher: kick a student
  @Delete(':id/students/:studentId')
  @UseGuards(RolesGuard)
  @Roles(Role.Teacher)
  @KickStudentDocs()
  async kick(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') classId: string,
    @Param('studentId') studentId: string,
  ) {
    return this.classesService.kickStudent(req.user!.id, classId, studentId);
  }

  // Admin/Teacher: add a student to a class (auto-approved)
  @Post(':id/students')
  @UseGuards(RolesGuard)
  @Roles(Role.Admin, Role.Teacher)
  @AddStudentDocs()
  async addStudent(
    @Req() req: Request & { user?: { id: string } },
    @Param('id') classId: string,
    @Body() dto: AddStudentDto,
  ) {
    const actorId = req.user!.id;
    const actorRole = (await this.getRoleFromRequest(req)) as Role;
    return this.classesService.addStudentToClass(
      actorId,
      actorRole,
      classId,
      dto.studentId,
    );
  }

  private async getRoleFromRequest(req: Request & { user?: { id: string } }) {
    // Fetch role from DB to avoid trusting client
    const user = await (this as any).classesService['prisma'].user.findUnique({
      where: { id: req.user!.id },
      select: { role: true },
    });
    return user?.role as Role;
  }
}

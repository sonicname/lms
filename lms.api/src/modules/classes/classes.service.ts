import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { Role } from 'src/modules/auth/constants/roles.enum';
import { CreateClassDto } from './dtos/create-class.dto';
import { ListAvailableStudentsDto } from './dtos/list-available-students.dto';
import { ListClassStudentsDto } from './dtos/list-class-students.dto';
import { ListClassTagsDto } from './dtos/list-class-tags.dto';
import { ListClassesDto } from './dtos/list-classes.dto';
import { UpdateClassDto } from './dtos/update-class.dto';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  private async requireTeacher(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.role !== Role.Teacher)
      throw new ForbiddenException('Only teachers allowed');
  }

  /**
   * Ensures class tags exist for the given teacher user and returns a list of { id } to connect/set.
   */
  private async prepareClassTags(
    ownerUserId: string,
    names?: string[],
  ): Promise<{ id: string }[] | null> {
    if (!names || !Array.isArray(names)) return null;
    const unique = Array.from(
      new Set(
        names
          .map((n) => (typeof n === 'string' ? n.trim() : ''))
          .filter((n) => n.length > 0),
      ),
    );
    if (unique.length === 0) return [];
    const ids: { id: string }[] = [];
    for (const name of unique) {
      let tag = await this.prisma.classTags.findFirst({
        where: { userId: ownerUserId, name },
        select: { id: true },
      });
      if (!tag) {
        try {
          tag = await this.prisma.classTags.create({
            data: { name, userId: ownerUserId },
            select: { id: true },
          });
        } catch (e: any) {
          // In case of race creating the same tag, read it again
          tag = await this.prisma.classTags.findFirst({
            where: { userId: ownerUserId, name },
            select: { id: true },
          });
        }
      }
      if (tag) ids.push({ id: tag.id });
    }
    return ids;
  }

  async createClass(actorId: string, actorRole: Role, dto: CreateClassDto) {
    let teacherId: string;
    if (actorRole === Role.Admin) {
      teacherId = dto.teacherId ?? actorId; // fallback to creator if not provided
    } else {
      // Teacher creating class for themselves
      await this.requireTeacher(actorId);
      teacherId = actorId;
    }

    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, role: true },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    if (teacher.role !== Role.Teacher)
      throw new ForbiddenException('Assigned user is not a teacher');

    // Prepare tags if provided: create (if needed) under teacher and connect
    const tagConnect = await this.prepareClassTags(teacherId, dto.tags);

    try {
      return await this.prisma.class.create({
        data: {
          name: dto.name,
          description: dto.description ?? null,
          code: dto.code,
          teacherId,
          ...(tagConnect ? { tags: { connect: tagConnect } } : {}),
          ...(Array.isArray(dto.banners) && dto.banners.length
            ? { banners: { connect: dto.banners.map((id) => ({ id })) } }
            : {}),
        },
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
          teacherId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002')
        throw new ConflictException('Class code already exists');
      throw e;
    }
  }

  async updateClass(
    actorId: string,
    actorRole: Role,
    id: string,
    dto: UpdateClassDto,
  ) {
    const cls = await this.prisma.class.findUnique({ where: { id } });
    if (!cls) throw new NotFoundException('Class not found');
    if (actorRole !== Role.Admin && cls.teacherId !== actorId)
      throw new ForbiddenException('Not allowed');

    let teacherId: string | undefined = undefined;
    if (actorRole === Role.Admin && dto.teacherId) {
      const t = await this.prisma.user.findUnique({
        where: { id: dto.teacherId },
        select: { role: true },
      });
      if (!t) throw new NotFoundException('Teacher not found');
      if (t.role !== Role.Teacher)
        throw new ForbiddenException('Assigned user is not a teacher');
      teacherId = dto.teacherId;
    }

    // If tags provided, ensure they exist for the owning teacher (after potential reassignment)
    const tagsSet = await this.prepareClassTags(
      teacherId ?? cls.teacherId,
      dto.tags,
    );

    try {
      return await this.prisma.class.update({
        where: { id },
        data: {
          name: dto.name ?? undefined,
          description: dto.description ?? undefined,
          code: dto.code ?? undefined,
          teacherId,
          ...(tagsSet ? { tags: { set: tagsSet } } : {}),
          ...(dto.banners !== undefined
            ? { banners: { set: (dto.banners || []).map((id) => ({ id })) } }
            : {}),
        },
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
          teacherId: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002')
        throw new ConflictException('Class code already exists');
      throw e;
    }
  }

  async assignTeacher(
    actorId: string,
    actorRole: Role,
    classId: string,
    teacherId: string,
  ) {
    if (actorRole !== Role.Admin) {
      throw new ForbiddenException('Only admin can assign teacher');
    }
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    const teacher = await this.prisma.user.findUnique({
      where: { id: teacherId },
      select: { id: true, role: true },
    });
    if (!teacher) throw new NotFoundException('Teacher not found');
    if (teacher.role !== Role.Teacher)
      throw new ForbiddenException('Assigned user is not a teacher');
    return this.prisma.class.update({
      where: { id: classId },
      data: { teacherId },
      select: {
        id: true,
        name: true,
        description: true,
        code: true,
        teacherId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteClass(actorId: string, actorRole: Role, id: string) {
    const cls = await this.prisma.class.findUnique({ where: { id } });
    if (!cls) throw new NotFoundException('Class not found');
    if (actorRole !== Role.Admin && cls.teacherId !== actorId)
      throw new ForbiddenException('Not allowed');
    await this.prisma.class.delete({ where: { id } });
    return { success: true };
  }

  async getClass(actorId: string, actorRole: Role, id: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        code: true,
        teacherId: true,
        createdAt: true,
        updatedAt: true,
        teacher: { select: { id: true, name: true, email: true } },
        students: {
          select: {
            studentId: true,
            status: true,
            approvedAt: true,
            student: { select: { id: true, name: true, email: true } },
          },
        },
        tags: { select: { id: true, name: true } },
        banners: { select: { id: true, url: true, filename: true } },
      },
    });
    if (!cls) throw new NotFoundException('Class not found');
    if (actorRole !== Role.Admin && cls.teacherId !== actorId)
      throw new ForbiddenException('Not allowed');
    return cls;
  }

  async listClasses(actorId: string, actorRole: Role, query: ListClassesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (actorRole !== Role.Admin) where.teacherId = actorId;
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.class.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
          teacherId: true,
          createdAt: true,
          updatedAt: true,
          banners: {
            take: 1,
            orderBy: { createdAt: 'desc' },
            select: { id: true, url: true, filename: true },
          },
        },
      }),
      this.prisma.class.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async studentJoinClass(studentId: string, classId: string) {
    // ensure class exists
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    try {
      return await this.prisma.classStudent.create({
        data: { classId, studentId, status: 'pending' },
        select: {
          classId: true,
          studentId: true,
          status: true,
          approvedAt: true,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002')
        throw new ConflictException('Already requested or enrolled');
      throw e;
    }
  }

  async approveStudent(teacherId: string, classId: string, studentId: string) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacherId !== teacherId)
      throw new ForbiddenException('Not allowed');
    const enrollment = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    return this.prisma.classStudent.update({
      where: { classId_studentId: { classId, studentId } },
      data: { status: 'approved', approvedAt: new Date() },
      select: {
        classId: true,
        studentId: true,
        status: true,
        approvedAt: true,
      },
    });
  }

  async kickStudent(teacherId: string, classId: string, studentId: string) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacherId !== teacherId)
      throw new ForbiddenException('Not allowed');
    await this.prisma.classStudent.delete({
      where: { classId_studentId: { classId, studentId } },
    });
    return { success: true };
  }

  async rejectStudent(
    actorId: string,
    actorRole: Role,
    classId: string,
    studentId: string,
  ) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    if (actorRole !== Role.Admin && cls.teacherId !== actorId)
      throw new ForbiddenException('Not allowed');

    const enrollment = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId } },
      select: { status: true },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.status === 'approved')
      throw new ConflictException('Already approved; use kick instead');

    await this.prisma.classStudent.delete({
      where: { classId_studentId: { classId, studentId } },
    });
    return { success: true };
  }

  async listClassStudents(
    actorId: string,
    actorRole: Role,
    classId: string,
    query: ListClassStudentsDto,
  ) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    if (actorRole !== Role.Admin && cls.teacherId !== actorId)
      throw new ForbiddenException('Not allowed');

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = { classId };
    if (query.status) where.status = query.status;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.classStudent.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          studentId: true,
          status: true,
          approvedAt: true,
          student: {
            select: { id: true, name: true, email: true, image: true },
          },
        },
      }),
      this.prisma.classStudent.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async addStudentToClass(
    actorId: string,
    actorRole: Role,
    classId: string,
    studentId: string,
  ) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    if (actorRole !== Role.Admin && cls.teacherId !== actorId)
      throw new ForbiddenException('Not allowed');

    const student = await this.prisma.user.findUnique({
      where: { id: studentId },
      select: { id: true, role: true },
    });
    if (!student) throw new NotFoundException('Student not found');
    if (student.role !== Role.Student)
      throw new ForbiddenException('User is not a student');

    const existing = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId } },
      select: { status: true },
    });
    if (existing?.status === 'approved')
      throw new ConflictException('Student already enrolled');

    if (existing && existing.status === 'pending') {
      return this.prisma.classStudent.update({
        where: { classId_studentId: { classId, studentId } },
        data: { status: 'approved', approvedAt: new Date() },
        select: {
          classId: true,
          studentId: true,
          status: true,
          approvedAt: true,
        },
      });
    }

    return this.prisma.classStudent.create({
      data: { classId, studentId, status: 'approved', approvedAt: new Date() },
      select: {
        classId: true,
        studentId: true,
        status: true,
        approvedAt: true,
      },
    });
  }

  async listMyApprovedClasses(studentId: string, query: ListClassesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
      students: { some: { studentId, status: 'approved' } },
    };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { code: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.class.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          description: true,
          code: true,
          teacherId: true,
          createdAt: true,
          updatedAt: true,
          teacher: {
            select: {
              image: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.class.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async listAvailableStudents(
    actorId: string,
    actorRole: Role,
    classId: string,
    query: ListAvailableStudentsDto,
  ) {
    const cls = await this.prisma.class.findUnique({ where: { id: classId } });
    if (!cls) throw new NotFoundException('Class not found');
    if (actorRole !== Role.Admin && cls.teacherId !== actorId)
      throw new ForbiddenException('Not allowed');

    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
      role: Role.Student,
      classEnrollments: { none: { classId } },
    };
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: { id: true, name: true, email: true, image: true },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async listClassTags(
    actorId: string,
    actorRole: Role,
    query: ListClassTagsDto,
  ) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (actorRole !== Role.Admin) {
      // Teachers: only their own tags
      where.userId = actorId;
    }
    if (query.search) {
      where.name = { contains: query.search, mode: 'insensitive' };
    }

    const [data, total] = await this.prisma.$transaction([
      this.prisma.classTags.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
        select: { id: true, name: true, createdAt: true, updatedAt: true },
      }),
      this.prisma.classTags.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }
}

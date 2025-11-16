import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { Role } from 'src/modules/auth/constants/roles.enum';

@Injectable()
export class CurriculumService {
  constructor(private readonly prisma: PrismaService) {}

  private async ensureTeacherOwnsClass(teacherId: string, classId: string) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });
    if (!cls) throw new NotFoundException('Class not found');
    if (cls.teacherId !== teacherId)
      throw new ForbiddenException('Not allowed');
  }

  private async ensureActorCanReadClass(
    actorId: string,
    actorRole: Role,
    classId: string,
  ) {
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });
    if (!cls) throw new NotFoundException('Class not found');
    if (actorRole === Role.Admin) return; // allow admin read
    if (actorRole === Role.Teacher) {
      if (cls.teacherId !== actorId)
        throw new ForbiddenException('Not allowed');
      return;
    }
    // Student must be approved
    const member = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId: actorId } },
      select: { status: true },
    });
    if (!member || member.status !== 'approved')
      throw new ForbiddenException('Not allowed');
  }

  // Chapters
  async createChapter(
    teacherId: string,
    classId: string,
    dto: { title: string; content?: string | null; displayOrder?: number },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    return this.prisma.chapter.create({
      data: {
        classId,
        title: dto.title,
        content: dto.content ?? null,
        displayOrder: dto.displayOrder ?? 1,
      },
      select: {
        id: true,
        title: true,
        content: true,
        displayOrder: true,
        classId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateChapter(
    teacherId: string,
    classId: string,
    chapterId: string,
    dto: { title?: string; content?: string | null; displayOrder?: number },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { classId: true },
    });
    if (!chapter || chapter.classId !== classId)
      throw new NotFoundException('Chapter not found');
    return this.prisma.chapter.update({
      where: { id: chapterId },
      data: {
        title: dto.title ?? undefined,
        content: dto.content ?? undefined,
        displayOrder: dto.displayOrder ?? undefined,
      },
      select: {
        id: true,
        title: true,
        content: true,
        displayOrder: true,
        classId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteChapter(teacherId: string, classId: string, chapterId: string) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { classId: true },
    });
    if (!chapter || chapter.classId !== classId)
      throw new NotFoundException('Chapter not found');
    await this.prisma.chapter.delete({ where: { id: chapterId } });
    return { success: true };
  }

  async listChapters(actorId: string, actorRole: Role, classId: string) {
    await this.ensureActorCanReadClass(actorId, actorRole, classId);
    return this.prisma.chapter.findMany({
      where: { classId },
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        content: true,
        displayOrder: true,
        classId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getChapter(
    actorId: string,
    actorRole: Role,
    classId: string,
    chapterId: string,
  ) {
    await this.ensureActorCanReadClass(actorId, actorRole, classId);
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
    });
    if (!chapter || chapter.classId !== classId)
      throw new NotFoundException('Chapter not found');
    return chapter;
  }

  // Lessons
  async createLesson(
    teacherId: string,
    classId: string,
    chapterId: string,
    dto: {
      title: string;
      content?: string | null;
      displayOrder?: number;
      scheduleDate?: Date | null;
    },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: chapterId },
      select: { classId: true },
    });
    if (!chapter || chapter.classId !== classId)
      throw new NotFoundException('Chapter not found');
    return this.prisma.lesson.create({
      data: {
        chapterId,
        title: dto.title,
        content: dto.content ?? null,
        displayOrder: dto.displayOrder ?? 1,
        scheduleDate: dto.scheduleDate ?? null,
      },
      select: {
        id: true,
        title: true,
        content: true,
        displayOrder: true,
        scheduleDate: true,
        chapterId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateLesson(
    teacherId: string,
    classId: string,
    chapterId: string,
    lessonId: string,
    dto: {
      title?: string;
      content?: string | null;
      displayOrder?: number;
      scheduleDate?: Date | null;
    },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: lesson.chapterId },
      select: { classId: true },
    });
    if (
      !chapter ||
      chapter.classId !== classId ||
      lesson.chapterId !== chapterId
    )
      throw new NotFoundException('Lesson not in chapter/class');
    return this.prisma.lesson.update({
      where: { id: lessonId },
      data: {
        title: dto.title ?? undefined,
        content: dto.content ?? undefined,
        displayOrder: dto.displayOrder ?? undefined,
        scheduleDate: dto.scheduleDate ?? undefined,
      },
      select: {
        id: true,
        title: true,
        content: true,
        displayOrder: true,
        scheduleDate: true,
        chapterId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteLesson(
    teacherId: string,
    classId: string,
    chapterId: string,
    lessonId: string,
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: lesson.chapterId },
      select: { classId: true },
    });
    if (
      !chapter ||
      chapter.classId !== classId ||
      lesson.chapterId !== chapterId
    )
      throw new NotFoundException('Lesson not in chapter/class');
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { success: true };
  }

  async listLessons(
    actorId: string,
    actorRole: Role,
    classId: string,
    chapterId: string,
  ) {
    await this.ensureActorCanReadClass(actorId, actorRole, classId);
    const baseWhere: any = { chapterId };

    return this.prisma.lesson.findMany({
      where: baseWhere,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        title: true,
        content: true,
        displayOrder: true,
        scheduleDate: true,
        chapterId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getLesson(
    actorId: string,
    actorRole: Role,
    classId: string,
    chapterId: string,
    lessonId: string,
  ) {
    await this.ensureActorCanReadClass(actorId, actorRole, classId);
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson || lesson.chapterId !== chapterId)
      throw new NotFoundException('Lesson not found');
    if (actorRole === Role.Student) {
      const now = new Date();
      const available = !lesson.scheduleDate || lesson.scheduleDate <= now;
      if (!available) throw new ForbiddenException('Lesson not yet available');
    }
    return lesson;
  }

  async listLessonAssets(
    actorId: string,
    actorRole: Role,
    classId: string,
    chapterId: string,
    lessonId: string,
  ) {
    await this.ensureActorCanReadClass(actorId, actorRole, classId);
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { chapterId: true, scheduleDate: true },
    });
    if (!lesson || lesson.chapterId !== chapterId)
      throw new NotFoundException('Lesson not found');
    if (actorRole === Role.Student) {
      const now = new Date();
      const available = !lesson.scheduleDate || lesson.scheduleDate <= now;
      if (!available) throw new ForbiddenException('Lesson not yet available');
    }
    return this.prisma.assets.findMany({
      where: { lessonId },
      select: {
        id: true,
        url: true,
        filename: true,
        mimetype: true,
        fileSize: true,
        type: true,
        createdAt: true,
      },
    });
  }

  async attachAssetsToLesson(
    teacherId: string,
    classId: string,
    chapterId: string,
    lessonId: string,
    assetIds: string[],
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    const chapter = await this.prisma.chapter.findUnique({
      where: { id: lesson.chapterId },
      select: { classId: true },
    });
    if (
      !chapter ||
      chapter.classId !== classId ||
      lesson.chapterId !== chapterId
    )
      throw new NotFoundException('Lesson not in chapter/class');

    // Only allow attaching assets owned by this teacher (unless admin, but this service is teacher-only)
    await this.prisma.assets.updateMany({
      where: { id: { in: assetIds }, userId: teacherId },
      data: { lessonId },
    });

    return this.prisma.assets.findMany({
      where: { lessonId },
      select: {
        id: true,
        url: true,
        filename: true,
        mimetype: true,
        fileSize: true,
        type: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

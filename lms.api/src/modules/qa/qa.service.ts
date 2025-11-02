import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { Role } from 'src/modules/auth/constants/roles.enum';

@Injectable()
export class QaService {
  constructor(private readonly prisma: PrismaService) {}

  private async getLessonContext(lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: {
        id: true,
        scheduleDate: true,
        chapterId: true,
        chapter: { select: { classId: true } },
      },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  private async ensureRouteMatches(
    lessonId: string,
    classId: string,
    chapterId: string,
  ) {
    const lesson = await this.getLessonContext(lessonId);
    if (lesson.chapterId !== chapterId || lesson.chapter.classId !== classId) {
      throw new NotFoundException(
        'Lesson not found in the specified class/chapter',
      );
    }
    return lesson;
  }

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
    role: Role,
    classId: string,
    scheduleDate: Date | null | undefined,
  ) {
    if (role === Role.Admin) return;
    const cls = await this.prisma.class.findUnique({
      where: { id: classId },
      select: { teacherId: true },
    });
    if (!cls) throw new NotFoundException('Class not found');
    if (role === Role.Teacher) {
      if (cls.teacherId !== actorId)
        throw new ForbiddenException('Not allowed');
      return;
    }
    // student must be approved and, if scheduleDate set, it must be in the past
    const enroll = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId: actorId } },
      select: { status: true },
    });
    if (!enroll || enroll.status !== 'approved')
      throw new ForbiddenException('Not allowed');
    if (scheduleDate) {
      const now = new Date();
      if (now < scheduleDate)
        throw new ForbiddenException('Lesson not yet available');
    }
  }

  // Questions
  async createQuestion(
    actorId: string,
    role: Role,
    classId: string,
    chapterId: string,
    lessonId: string,
    dto: { title: string; content: string },
  ) {
    const lesson = await this.ensureRouteMatches(lessonId, classId, chapterId);
    await this.ensureActorCanReadClass(
      actorId,
      role,
      classId,
      lesson.scheduleDate ?? null,
    );
    return this.prisma.question.create({
      data: {
        title: dto.title,
        content: dto.content,
        userId: actorId,
        lessonId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        lessonId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listQuestions(
    actorId: string,
    role: Role,
    classId: string,
    chapterId: string,
    lessonId: string,
  ) {
    const lesson = await this.ensureRouteMatches(lessonId, classId, chapterId);
    await this.ensureActorCanReadClass(
      actorId,
      role,
      classId,
      lesson.scheduleDate ?? null,
    );
    return this.prisma.question.findMany({
      where: { lessonId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getQuestion(
    actorId: string,
    role: Role,
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
  ) {
    const lesson = await this.ensureRouteMatches(lessonId, classId, chapterId);
    await this.ensureActorCanReadClass(
      actorId,
      role,
      classId,
      lesson.scheduleDate ?? null,
    );
    const q = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        lessonId: true,
        createdAt: true,
        updatedAt: true,
        Answer: {
          select: {
            id: true,
            content: true,
            userId: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!q || q.lessonId !== lessonId)
      throw new NotFoundException('Question not found');
    return q;
  }

  async updateQuestion(
    actorId: string,
    role: Role,
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
    dto: { title?: string; content?: string },
  ) {
    const lesson = await this.ensureRouteMatches(lessonId, classId, chapterId);
    await this.ensureActorCanReadClass(
      actorId,
      role,
      classId,
      lesson.scheduleDate ?? null,
    );
    const q = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { userId: true, lessonId: true },
    });
    if (!q || q.lessonId !== lessonId)
      throw new NotFoundException('Question not found');
    if (role !== Role.Admin && q.userId !== actorId) {
      // if teacher of class, allow
      const cls = await this.prisma.class.findUnique({
        where: { id: classId },
        select: { teacherId: true },
      });
      if (!cls || cls.teacherId !== actorId)
        throw new ForbiddenException('Not allowed');
    }
    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        title: dto.title ?? undefined,
        content: dto.content ?? undefined,
      },
      select: {
        id: true,
        title: true,
        content: true,
        userId: true,
        lessonId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteQuestion(
    actorId: string,
    role: Role,
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
  ) {
    const lesson = await this.ensureRouteMatches(lessonId, classId, chapterId);
    await this.ensureActorCanReadClass(
      actorId,
      role,
      classId,
      lesson.scheduleDate ?? null,
    );
    const q = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { userId: true, lessonId: true },
    });
    if (!q || q.lessonId !== lessonId)
      throw new NotFoundException('Question not found');
    if (role !== Role.Admin && q.userId !== actorId) {
      const cls = await this.prisma.class.findUnique({
        where: { id: classId },
        select: { teacherId: true },
      });
      if (!cls || cls.teacherId !== actorId)
        throw new ForbiddenException('Not allowed');
    }
    await this.prisma.answer.deleteMany({ where: { questionId } });
    await this.prisma.question.delete({ where: { id: questionId } });
    return { success: true };
  }

  // Answers
  async createAnswer(
    actorId: string,
    role: Role,
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
    dto: { content: string },
  ) {
    const lesson = await this.ensureRouteMatches(lessonId, classId, chapterId);
    await this.ensureActorCanReadClass(
      actorId,
      role,
      classId,
      lesson.scheduleDate ?? null,
    );
    const q = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { lessonId: true },
    });
    if (!q || q.lessonId !== lessonId)
      throw new NotFoundException('Question not found');
    return this.prisma.answer.create({
      data: { content: dto.content, userId: actorId, questionId },
      select: {
        id: true,
        content: true,
        userId: true,
        questionId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listAnswers(
    actorId: string,
    role: Role,
    classId: string,
    chapterId: string,
    lessonId: string,
    questionId: string,
  ) {
    const lesson = await this.ensureRouteMatches(lessonId, classId, chapterId);
    await this.ensureActorCanReadClass(
      actorId,
      role,
      classId,
      lesson.scheduleDate ?? null,
    );
    const q = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { lessonId: true },
    });
    if (!q || q.lessonId !== lessonId)
      throw new NotFoundException('Question not found');
    return this.prisma.answer.findMany({
      where: { questionId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        content: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateAnswer(
    actorId: string,
    role: Role,
    classId: string,
    questionId: string,
    answerId: string,
    dto: { content?: string },
  ) {
    const a = await this.prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        userId: true,
        question: {
          select: {
            id: true,
            lesson: { select: { chapter: { select: { classId: true } } } },
          },
        },
      },
    });
    if (!a || a.question.id !== questionId)
      throw new NotFoundException('Answer not found');
    const classIdOfAnswer = a.question.lesson.chapter.classId;
    if (classIdOfAnswer !== classId)
      throw new NotFoundException('Answer not found');
    if (role !== Role.Admin && a.userId !== actorId) {
      const cls = await this.prisma.class.findUnique({
        where: { id: classId },
        select: { teacherId: true },
      });
      if (!cls || cls.teacherId !== actorId)
        throw new ForbiddenException('Not allowed');
    }
    return this.prisma.answer.update({
      where: { id: answerId },
      data: { content: dto.content ?? undefined },
      select: {
        id: true,
        content: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteAnswer(
    actorId: string,
    role: Role,
    classId: string,
    questionId: string,
    answerId: string,
  ) {
    const a = await this.prisma.answer.findUnique({
      where: { id: answerId },
      select: {
        userId: true,
        question: {
          select: {
            id: true,
            lesson: { select: { chapter: { select: { classId: true } } } },
          },
        },
      },
    });
    if (!a || a.question.id !== questionId)
      throw new NotFoundException('Answer not found');
    const classIdOfAnswer = a.question.lesson.chapter.classId;
    if (classIdOfAnswer !== classId)
      throw new NotFoundException('Answer not found');
    if (role !== Role.Admin && a.userId !== actorId) {
      const cls = await this.prisma.class.findUnique({
        where: { id: classId },
        select: { teacherId: true },
      });
      if (!cls || cls.teacherId !== actorId)
        throw new ForbiddenException('Not allowed');
    }
    await this.prisma.answer.delete({ where: { id: answerId } });
    return { success: true };
  }
}

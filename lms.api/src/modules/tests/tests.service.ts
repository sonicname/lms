import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { Role } from 'src/modules/auth/constants/roles.enum';

@Injectable()
export class TestsService {
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
    if (actorRole === Role.Admin) return;
    if (actorRole === Role.Teacher) {
      if (cls.teacherId !== actorId)
        throw new ForbiddenException('Not allowed');
      return;
    }
    const member = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId: actorId } },
      select: { status: true },
    });
    if (!member || member.status !== 'approved')
      throw new ForbiddenException('Not allowed');
  }

  // Tests
  async createTest(
    teacherId: string,
    classId: string,
    dto: { name: string; startDate?: Date | null; endDate?: Date | null },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    return this.prisma.test.create({
      data: {
        name: dto.name,
        userCreatedId: teacherId,
        classId,
        startDate: dto.startDate ?? null,
        endDate: dto.endDate ?? null,
      },
      select: {
        id: true,
        name: true,
        classId: true,
        userCreatedId: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateTest(
    teacherId: string,
    classId: string,
    testId: string,
    dto: { name?: string; startDate?: Date | null; endDate?: Date | null },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { classId: true },
    });
    if (!test || test.classId !== classId)
      throw new NotFoundException('Test not found');
    return this.prisma.test.update({
      where: { id: testId },
      data: {
        name: dto.name ?? undefined,
        startDate: dto.startDate ?? undefined,
        endDate: dto.endDate ?? undefined,
      },
      select: {
        id: true,
        name: true,
        classId: true,
        userCreatedId: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async attachAssetsToTest(
    teacherId: string,
    classId: string,
    testId: string,
    assetIds: string[],
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { classId: true },
    });
    if (!test || test.classId !== classId)
      throw new NotFoundException('Test not found');

    if (!assetIds || assetIds.length === 0) return { success: true };

    const teacherAssets = await this.prisma.assets.findMany({
      where: { id: { in: assetIds }, userId: teacherId },
    });
    if (teacherAssets.length !== assetIds.length)
      throw new ForbiddenException('Some assets are not owned by you');

    await this.prisma.assets.updateMany({
      where: { id: { in: assetIds } },
      data: { testId },
    });
    return { success: true };
  }

  async listTests(actorId: string, actorRole: Role, classId: string) {
    await this.ensureActorCanReadClass(actorId, actorRole, classId);
    const where: any = { classId };
    if (actorRole === Role.Student) {
      const now = new Date();
      where.OR = [{ startDate: null }, { startDate: { lte: now } }];
    }
    return this.prisma.test.findMany({
      where,
      orderBy: [{ startDate: 'asc' }, { createdAt: 'asc' }],
      select: {
        id: true,
        name: true,
        classId: true,
        userCreatedId: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async getTest(
    actorId: string,
    actorRole: Role,
    classId: string,
    testId: string,
  ) {
    await this.ensureActorCanReadClass(actorId, actorRole, classId);
    const test = await this.prisma.test.findUnique({ where: { id: testId } });
    if (!test || test.classId !== classId)
      throw new NotFoundException('Test not found');
    if (actorRole === Role.Student) {
      const now = new Date();
      const available = !test.startDate || test.startDate <= now;
      if (!available) throw new ForbiddenException('Test not yet available');
    }
    return test;
  }

  // Submissions
  private async ensureSubmissionWindow(testId: string) {
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { startDate: true, endDate: true },
    });
    if (!test) throw new NotFoundException('Test not found');
    const now = new Date();
    if (test.startDate && now < test.startDate)
      throw new ForbiddenException('Submission not open');
    if (test.endDate && now > test.endDate)
      throw new ForbiddenException('Submission closed');
  }

  async submitTest(
    studentId: string,
    classId: string,
    testId: string,
    assetIds: string[] | undefined,
  ) {
    // ensure student is in class approved
    const member = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId } },
      select: { status: true },
    });
    if (!member || member.status !== 'approved')
      throw new ForbiddenException('Not allowed');
    await this.ensureSubmissionWindow(testId);

    // upsert submission (one per test per student)
    let submission = await this.prisma.submission.findFirst({
      where: { testId, userId: studentId },
    });
    if (!submission) {
      submission = await this.prisma.submission.create({
        data: { testId, userId: studentId },
      });
    }

    if (assetIds && assetIds.length > 0) {
      const owned = await this.prisma.assets.findMany({
        where: { id: { in: assetIds }, userId: studentId },
      });
      if (owned.length !== assetIds.length)
        throw new ForbiddenException('Some assets not owned by you');
      await this.prisma.assets.updateMany({
        where: { id: { in: assetIds } },
        data: { submissionId: submission.id },
      });
    }

    return this.prisma.submission.findUnique({
      where: { id: submission.id },
      select: {
        id: true,
        userId: true,
        testId: true,
        score: true,
        feedback: true,
        createdAt: true,
        updatedAt: true,
        assets: {
          select: { id: true, url: true, filename: true, mimetype: true },
        },
      },
    });
  }

  async listSubmissions(teacherId: string, classId: string, testId: string) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { classId: true },
    });
    if (!test || test.classId !== classId)
      throw new NotFoundException('Test not found');
    return this.prisma.submission.findMany({
      where: { testId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        userId: true,
        score: true,
        feedback: true,
        createdAt: true,
        updatedAt: true,
        user: { select: { id: true, name: true, email: true } },
        assets: {
          select: { id: true, url: true, filename: true, mimetype: true },
        },
      },
    });
  }

  async gradeSubmission(
    teacherId: string,
    classId: string,
    testId: string,
    submissionId: string,
    dto: { score?: number | null; feedback?: string | null },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const sub = await this.prisma.submission.findUnique({
      where: { id: submissionId },
      select: { testId: true },
    });
    if (!sub || sub.testId !== testId)
      throw new NotFoundException('Submission not found');
    return this.prisma.submission.update({
      where: { id: submissionId },
      data: { score: dto.score ?? null, feedback: dto.feedback ?? null },
      select: {
        id: true,
        userId: true,
        testId: true,
        score: true,
        feedback: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}

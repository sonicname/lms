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
    dto: {
      name: string;
      type?: 'essay' | 'mcq';
      startDate?: Date | null;
      endDate?: Date | null;
    },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    return this.prisma.test.create({
      data: {
        name: dto.name,
        type: (dto.type as any) ?? 'mcq',
        userCreatedId: teacherId,
        classId,
        startDate: dto.startDate ?? null,
        endDate: dto.endDate ?? null,
      },
      select: {
        id: true,
        name: true,
        type: true,
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
    dto: {
      name?: string;
      type?: 'essay' | 'mcq';
      startDate?: Date | null;
      endDate?: Date | null;
    },
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
        type: (dto.type as any) ?? undefined,
        startDate: dto.startDate ?? undefined,
        endDate: dto.endDate ?? undefined,
      },
      select: {
        id: true,
        name: true,
        type: true,
        classId: true,
        userCreatedId: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteTest(teacherId: string, classId: string, testId: string) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { classId: true },
    });
    if (!test || test.classId !== classId)
      throw new NotFoundException('Test not found');
    await this.prisma.test.delete({ where: { id: testId } });
    return { success: true };
  }

  // ----- Essay Questions CRUD -----
  async listEssayQuestions(
    actorId: string,
    actorRole: Role,
    classId: string,
    testId: string,
  ) {
    await this.ensureActorCanReadClass(actorId, actorRole, classId);
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { classId: true, type: true },
    });
    if (!test || test.classId !== classId)
      throw new NotFoundException('Test not found');
    return this.prisma.essayQuestion.findMany({
      where: { testId },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        prompt: true,
        displayOrder: true,
        createdAt: true,
        updatedAt: true,
        assets: {
          select: { id: true, url: true, filename: true, mimetype: true },
        },
      },
    });
  }

  async createEssayQuestion(
    teacherId: string,
    classId: string,
    testId: string,
    dto: { prompt?: string | null; displayOrder?: number | null },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { classId: true, type: true },
    });
    if (!test || test.classId !== classId)
      throw new NotFoundException('Test not found');
    return this.prisma.essayQuestion.create({
      data: {
        testId,
        prompt: dto.prompt ?? null,
        displayOrder: dto.displayOrder ?? 1,
      },
      select: {
        id: true,
        prompt: true,
        displayOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateEssayQuestion(
    teacherId: string,
    classId: string,
    testId: string,
    questionId: string,
    dto: { prompt?: string | null; displayOrder?: number | null },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const q = await this.prisma.essayQuestion.findUnique({
      where: { id: questionId },
      select: { testId: true, test: { select: { classId: true } } },
    });
    if (!q || q.testId !== testId || q.test.classId !== classId)
      throw new NotFoundException('Essay question not found');
    return this.prisma.essayQuestion.update({
      where: { id: questionId },
      data: {
        prompt: dto.prompt ?? undefined,
        displayOrder: dto.displayOrder ?? undefined,
      },
      select: {
        id: true,
        prompt: true,
        displayOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async deleteEssayQuestion(
    teacherId: string,
    classId: string,
    testId: string,
    questionId: string,
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const q = await this.prisma.essayQuestion.findUnique({
      where: { id: questionId },
      select: { testId: true, test: { select: { classId: true } } },
    });
    if (!q || q.testId !== testId || q.test.classId !== classId)
      throw new NotFoundException('Essay question not found');
    await this.prisma.essayQuestion.delete({ where: { id: questionId } });
    return { success: true };
  }

  async attachAssetsToEssayQuestion(
    teacherId: string,
    classId: string,
    testId: string,
    questionId: string,
    assetIds: string[],
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const q = await this.prisma.essayQuestion.findUnique({
      where: { id: questionId },
      select: { testId: true, test: { select: { classId: true } } },
    });
    if (!q || q.testId !== testId || q.test.classId !== classId)
      throw new NotFoundException('Essay question not found');
    if (!assetIds || assetIds.length === 0) return { success: true };
    const owned = await this.prisma.assets.findMany({
      where: { id: { in: assetIds }, userId: teacherId },
    });
    if (owned.length !== assetIds.length)
      throw new ForbiddenException('Some assets are not owned by you');
    await this.prisma.assets.updateMany({
      where: { id: { in: assetIds } },
      data: { essayQuestionId: questionId },
    });
    return { success: true };
  }

  // ----- MCQ: Import quizzes by tag -----
  async importQuizzesByTags(
    teacherId: string,
    classId: string,
    testId: string,
    dto: {
      tagIds?: string[];
      tagNames?: string[];
      points?: number | null;
      startOrder?: number | null;
    },
  ) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    const test = await this.prisma.test.findUnique({
      where: { id: testId },
      select: { classId: true },
    });
    if (!test || test.classId !== classId)
      throw new NotFoundException('Test not found');

    // find quizzes by tag criteria
    const tagsWhere: any[] = [];
    if (dto.tagIds && dto.tagIds.length)
      tagsWhere.push({ id: { in: dto.tagIds } });
    if (dto.tagNames && dto.tagNames.length)
      tagsWhere.push({ name: { in: dto.tagNames } });
    if (tagsWhere.length === 0) return { inserted: 0 };

    const quizzes = await this.prisma.quiz.findMany({
      where: { tags: { some: { OR: tagsWhere } }, userId: teacherId },
      select: { id: true },
    });
    if (quizzes.length === 0) return { inserted: 0 };

    // determine next displayOrder
    const existingCount = await this.prisma.testQuiz.count({
      where: { testId },
    });
    const start = dto.startOrder ?? existingCount + 1;
    const points = dto.points ?? 1;

    await this.prisma.testQuiz.createMany({
      data: quizzes.map((q, idx) => ({
        testId,
        quizId: q.id,
        displayOrder: start + idx,
        points,
      })),
      skipDuplicates: true,
    });
    return { inserted: quizzes.length };
  }

  // ----- MCQ: Submit answers and auto-grade -----
  async submitMcqAnswers(
    studentId: string,
    classId: string,
    testId: string,
    answers: { quizId: string; choiceId: string | null }[],
  ) {
    // ensure student is in class
    const member = await this.prisma.classStudent.findUnique({
      where: { classId_studentId: { classId, studentId } },
      select: { status: true },
    });
    if (!member || member.status !== 'approved')
      throw new ForbiddenException('Not allowed');
    await this.ensureSubmissionWindow(testId);

    // upsert submission
    let submission = await this.prisma.submission.findFirst({
      where: { testId, userId: studentId },
    });
    if (!submission)
      submission = await this.prisma.submission.create({
        data: { testId, userId: studentId },
      });

    if (answers && answers.length) {
      for (const a of answers) {
        // compute correctness
        const quiz = await this.prisma.quiz.findUnique({
          where: { id: a.quizId },
          select: { correctChoiceId: true },
        });
        if (!quiz) continue;
        const correct =
          quiz.correctChoiceId && a.choiceId
            ? quiz.correctChoiceId === a.choiceId
            : null;
        // upsert answer
        const existing = await this.prisma.submissionAnswer.findUnique({
          where: {
            submissionId_quizId: {
              submissionId: submission.id,
              quizId: a.quizId,
            },
          },
        });
        if (!existing) {
          await this.prisma.submissionAnswer.create({
            data: {
              submissionId: submission.id,
              quizId: a.quizId,
              choiceId: a.choiceId ?? null,
              isCorrect: correct ?? undefined,
            },
          });
        } else {
          await this.prisma.submissionAnswer.update({
            where: { id: existing.id },
            data: {
              choiceId: a.choiceId ?? null,
              isCorrect: correct ?? undefined,
            },
          });
        }
      }
    }

    // recompute score
    const allAnswers = await this.prisma.submissionAnswer.findMany({
      where: { submissionId: submission.id },
    });
    if (allAnswers.length) {
      // map quizId -> points
      const quizIds = allAnswers.map((x) => x.quizId);
      const tq = await this.prisma.testQuiz.findMany({
        where: { testId, quizId: { in: quizIds } },
        select: { quizId: true, points: true },
      });
      const pointsMap = new Map(
        tq.map((x) => [x.quizId, x.points ?? 1] as const),
      );
      let total = 0;
      for (const a of allAnswers) {
        if (a.isCorrect) total += pointsMap.get(a.quizId) ?? 1;
      }
      await this.prisma.submission.update({
        where: { id: submission.id },
        data: { score: total },
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
        answers: {
          select: { id: true, quizId: true, choiceId: true, isCorrect: true },
        },
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
        type: true,
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

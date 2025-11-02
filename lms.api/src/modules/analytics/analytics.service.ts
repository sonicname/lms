import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async adminOverview() {
    const [
      users,
      teachers,
      students,
      classes,
      chapters,
      lessons,
      tests,
      submissions,
      questions,
      answers,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { role: 'teacher' } }),
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.class.count(),
      this.prisma.chapter.count(),
      this.prisma.lesson.count(),
      this.prisma.test.count(),
      this.prisma.submission.count(),
      this.prisma.question.count(),
      this.prisma.answer.count(),
    ]);

    const avgScoreAgg = await this.prisma.submission.aggregate({
      _avg: { score: true },
    });

    return {
      totals: {
        users,
        teachers,
        students,
        classes,
        chapters,
        lessons,
        tests,
        submissions,
        questions,
        answers,
      },
      averages: {
        submissionScore: avgScoreAgg._avg.score ?? null,
      },
    };
  }

  async adminEngagement(from?: Date, to?: Date) {
    const createdAt = this._dateRangeFilter(from, to);
    const [
      submissionsCount,
      questionsCount,
      answersCount,
      newUsersCount,
      avgScore,
    ] = await Promise.all([
      this.prisma.submission.count({ where: { createdAt } }),
      this.prisma.question.count({ where: { createdAt } }),
      this.prisma.answer.count({ where: { createdAt } }),
      this.prisma.user.count({ where: { createdAt } }),
      this.prisma.submission.aggregate({
        _avg: { score: true },
        where: { createdAt },
      }),
    ]);

    return {
      window: { from: from ?? null, to: to ?? null },
      submissionsCount,
      questionsCount,
      answersCount,
      newUsersCount,
      avgScore: avgScore._avg.score ?? null,
    };
  }

  async adminClassOverview(classId: string) {
    const klass = await this.prisma.class.findUnique({
      where: { id: classId },
    });
    if (!klass) throw new NotFoundException('Class not found');

    const [
      studentsTotal,
      studentsApproved,
      chapters,
      lessons,
      tests,
      submissions,
      avgScoreAgg,
      qCount,
      aCount,
    ] = await Promise.all([
      this.prisma.classStudent.count({ where: { classId } }),
      this.prisma.classStudent.count({
        where: { classId, status: 'approved' },
      }),
      this.prisma.chapter.count({ where: { classId } }),
      this.prisma.lesson.count({ where: { chapter: { classId } } }),
      this.prisma.test.count({ where: { classId } }),
      this.prisma.submission.count({ where: { test: { classId } } }),
      this.prisma.submission.aggregate({
        _avg: { score: true },
        where: { test: { classId } },
      }),
      this.prisma.question.count({
        where: { lesson: { chapter: { classId } } },
      }),
      this.prisma.answer.count({
        where: { question: { lesson: { chapter: { classId } } } },
      }),
    ]);

    const testsPerApprovedStudent = tests * (studentsApproved || 0);
    const submissionRate = testsPerApprovedStudent
      ? submissions / testsPerApprovedStudent
      : null;

    return {
      class: { id: classId, name: klass.name },
      students: {
        total: studentsTotal,
        approved: studentsApproved,
        pending: studentsTotal - studentsApproved,
      },
      content: { chapters, lessons },
      assessments: {
        tests,
        submissions,
        submissionRate,
        avgScore: avgScoreAgg._avg.score ?? null,
      },
      qa: { questions: qCount, answers: aCount },
    };
  }

  async teacherOverview(teacherId: string) {
    const [
      classesCount,
      studentsApproved,
      chapters,
      lessons,
      tests,
      submissions,
      avgScoreAgg,
      questions,
      answers,
    ] = await Promise.all([
      this.prisma.class.count({ where: { teacherId } }),
      this.prisma.classStudent.count({
        where: { class: { teacherId }, status: 'approved' },
      }),
      this.prisma.chapter.count({ where: { class: { teacherId } } }),
      this.prisma.lesson.count({
        where: { chapter: { class: { teacherId } } },
      }),
      this.prisma.test.count({ where: { class: { teacherId } } }),
      this.prisma.submission.count({
        where: { test: { class: { teacherId } } },
      }),
      this.prisma.submission.aggregate({
        _avg: { score: true },
        where: { test: { class: { teacherId } } },
      }),
      this.prisma.question.count({
        where: { lesson: { chapter: { class: { teacherId } } } },
      }),
      this.prisma.answer.count({
        where: { question: { lesson: { chapter: { class: { teacherId } } } } },
      }),
    ]);

    return {
      classesCount,
      studentsApproved,
      chapters,
      lessons,
      tests,
      submissions,
      avgScore: avgScoreAgg._avg.score ?? null,
      questions,
      answers,
    };
  }

  async teacherClassOverview(teacherId: string, classId: string) {
    await this.ensureTeacherOwnsClass(teacherId, classId);
    return this.adminClassOverview(classId);
  }

  private async ensureTeacherOwnsClass(teacherId: string, classId: string) {
    const klass = await this.prisma.class.findFirst({
      where: { id: classId, teacherId },
      select: { id: true },
    });
    if (!klass) throw new ForbiddenException('Not class owner');
  }

  private _dateRangeFilter(from?: Date, to?: Date) {
    if (!from && !to) return undefined;
    const gte = from ? new Date(from) : undefined;
    const lte = to ? new Date(to) : undefined;
    return { ...(gte ? { gte } : {}), ...(lte ? { lte } : {}) } as {
      gte?: Date;
      lte?: Date;
    };
  }
}

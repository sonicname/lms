import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../databases/prisma.service';
import { CreateChoiceDto } from './dtos/create-choice.dto';
import { CreateQuizDto } from './dtos/create-quiz.dto';
import { UpdateChoiceDto } from './dtos/update-choice.dto';
import { UpdateQuizDto } from './dtos/update-quiz.dto';

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  private quizSelect() {
    return {
      id: true,
      title: true,
      content: true,
      correctChoiceId: true,
      userId: true,
      tags: { select: { id: true, name: true } },
      createdAt: true,
      updatedAt: true,
    } as const;
  }

  private choiceSelect() {
    return {
      id: true,
      content: true,
      quizId: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }

  async listMyQuizzes(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await this.prisma.$transaction([
      this.prisma.quiz.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: this.quizSelect(),
      }),
      this.prisma.quiz.count({ where: { userId } }),
    ]);
    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async getMyQuiz(userId: string, id: string) {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id, userId },
      select: this.quizSelect(),
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    return quiz;
  }

  async createMyQuiz(userId: string, dto: CreateQuizDto) {
    return this.prisma.quiz.create({
      data: { userId, title: dto.title, content: dto.content ?? null },
      select: this.quizSelect(),
    });
  }

  async updateMyQuiz(userId: string, id: string, dto: UpdateQuizDto) {
    const existing = await this.prisma.quiz.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
      throw new NotFoundException('Quiz not found');
    return this.prisma.quiz.update({
      where: { id },
      data: {
        title: dto.title ?? undefined,
        content: dto.content ?? undefined,
      },
      select: this.quizSelect(),
    });
  }

  async deleteMyQuiz(userId: string, id: string) {
    const existing = await this.prisma.quiz.findUnique({ where: { id } });
    if (!existing || existing.userId !== userId)
      throw new NotFoundException('Quiz not found');
    await this.prisma.quiz.delete({ where: { id } });
    return { success: true };
  }

  // Choices operations (scoped to user's quiz)
  private async ensureQuizOwned(userId: string, quizId: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, userId: true },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.userId !== userId) throw new ForbiddenException('Not owner');
    return quiz;
  }

  async listChoices(userId: string, quizId: string) {
    await this.ensureQuizOwned(userId, quizId);
    return this.prisma.choice.findMany({
      where: { quizId: quizId },
      orderBy: { createdAt: 'asc' },
      select: this.choiceSelect(),
    });
  }

  async createChoice(userId: string, quizId: string, dto: CreateChoiceDto) {
    await this.ensureQuizOwned(userId, quizId);
    // Create choice, and if marked correct, set quiz.correctChoiceId
    const created = await this.prisma.choice.create({
      data: { quizId, content: dto.content },
      select: this.choiceSelect(),
    });
    if (dto.isCorrect === true) {
      await this.prisma.quiz.update({
        where: { id: quizId },
        data: { correctChoiceId: created.id },
        select: { id: true },
      });
    }
    return created;
  }

  async updateChoice(
    userId: string,
    quizId: string,
    choiceId: string,
    dto: UpdateChoiceDto,
  ) {
    await this.ensureQuizOwned(userId, quizId);
    const choice = await this.prisma.choice.findUnique({
      where: { id: choiceId },
      select: { id: true, quizId: true },
    });
    if (!choice || choice.quizId !== quizId)
      throw new NotFoundException('Choice not found');
    const updated = await this.prisma.choice.update({
      where: { id: choiceId },
      data: {
        content: dto.content ?? undefined,
      },
      select: this.choiceSelect(),
    });
    // Update correct choice mapping if requested
    if (dto.isCorrect !== undefined) {
      if (dto.isCorrect === true) {
        await this.prisma.quiz.update({
          where: { id: quizId },
          data: { correctChoiceId: choiceId },
        });
      } else {
        // if unsetting and current correct is this choice, null it
        const q = await this.prisma.quiz.findUnique({
          where: { id: quizId },
          select: { correctChoiceId: true },
        });
        if (q?.correctChoiceId === choiceId) {
          await this.prisma.quiz.update({
            where: { id: quizId },
            data: { correctChoiceId: null },
          });
        }
      }
    }
    return updated;
  }

  // ----- Tags management -----
  async listTags(userId: string, quizId: string) {
    await this.ensureQuizOwned(userId, quizId);
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { tags: { select: { id: true, name: true } } },
    });
    return quiz?.tags ?? [];
  }

  async attachTagsByNames(userId: string, quizId: string, names: string[]) {
    await this.ensureQuizOwned(userId, quizId);
    if (!names.length) return { success: true, attached: 0 };
    // Upsert tags by name then connect
    const existingTags = await this.prisma.quizTags.findMany({
      where: { name: { in: names } },
      select: { id: true, name: true },
    });
    const existingNames = new Set(existingTags.map((t) => t.name));
    const toCreate = names.filter((n) => !existingNames.has(n));
    if (toCreate.length) {
      await this.prisma.quizTags.createMany({
        data: toCreate.map((n) => ({ name: n })),
        skipDuplicates: true,
      });
    }
    const allTags = await this.prisma.quizTags.findMany({
      where: { name: { in: names } },
      select: { id: true },
    });
    // Connect tags to quiz
    await this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        tags: { set: [], connect: allTags.map((t) => ({ id: t.id })) },
      },
      select: { id: true },
    });
    return { success: true, attached: allTags.length };
  }

  async detachTag(userId: string, quizId: string, tagId: string) {
    await this.ensureQuizOwned(userId, quizId);
    await this.prisma.quiz.update({
      where: { id: quizId },
      data: { tags: { disconnect: { id: tagId } } },
      select: { id: true },
    });
    return { success: true };
  }

  async deleteChoice(userId: string, quizId: string, choiceId: string) {
    await this.ensureQuizOwned(userId, quizId);
    const choice = await this.prisma.choice.findUnique({
      where: { id: choiceId },
      select: { id: true, quizId: true },
    });
    if (!choice || choice.quizId !== quizId)
      throw new NotFoundException('Choice not found');
    await this.prisma.choice.delete({ where: { id: choiceId } });
    return { success: true };
  }
}

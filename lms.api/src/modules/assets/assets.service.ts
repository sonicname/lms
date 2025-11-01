import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import type { Prisma } from 'src/generated/prisma/client';
import { Role } from 'src/modules/auth/constants/roles.enum';
import { ListAssetsDto } from './dtos/list-assets.dto';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  private async getUserRole(userId: string): Promise<Role> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    return (user?.role as Role) ?? Role.Student;
  }

  async createFromUpload(params: {
    userId: string;
    filename: string;
    mimetype: string;
    size: number;
    url: string;
    fileType?: string | null;
    type?: string | null;
  }) {
    const { userId, filename, mimetype, size, url, fileType, type } = params;
    return this.prisma.assets.create({
      data: {
        userId,
        filename,
        mimetype,
        fileSize: size,
        url,
        fileType: fileType ?? 'file',
        type: type ?? null,
      },
      select: {
        id: true,
        fileType: true,
        filename: true,
        mimetype: true,
        fileSize: true,
        url: true,
        type: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async list(userId: string, query: ListAssetsDto) {
    const role = await this.getUserRole(userId);
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const whereAnd: Prisma.AssetsWhereInput[] = [];
    if (role !== Role.Admin) {
      whereAnd.push({ userId });
    }
    if (query.search) {
      whereAnd.push({
        OR: [
          { filename: { contains: query.search, mode: 'insensitive' } },
          { type: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }
    if (query.type)
      whereAnd.push({ type: { contains: query.type, mode: 'insensitive' } });
    if (query.fileType)
      whereAnd.push({
        fileType: { contains: query.fileType, mode: 'insensitive' },
      });

    const where: Prisma.AssetsWhereInput = whereAnd.length
      ? { AND: whereAnd }
      : {};

    const orderBy: Prisma.AssetsOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    } as Prisma.AssetsOrderByWithRelationInput;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.assets.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          fileType: true,
          filename: true,
          mimetype: true,
          fileSize: true,
          url: true,
          type: true,
          userId: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.assets.count({ where }),
    ]);

    return {
      data,
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    };
  }

  async getById(userId: string, id: string) {
    const role = await this.getUserRole(userId);
    const asset = await this.prisma.assets.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    if (role !== Role.Admin && asset.userId !== userId)
      throw new ForbiddenException('Not allowed');
    return asset;
  }

  async delete(userId: string, id: string) {
    const role = await this.getUserRole(userId);
    const asset = await this.prisma.assets.findUnique({ where: { id } });
    if (!asset) throw new NotFoundException('Asset not found');
    if (role !== Role.Admin && asset.userId !== userId)
      throw new ForbiddenException('Not allowed');
    await this.prisma.assets.delete({ where: { id } });
    // Best-effort delete from disk if path matches our uploads folder
    try {
      const uploadsDir = require('node:path').join(process.cwd(), 'uploads');
      const fs = require('node:fs');
      const filePath = require('node:path').join(uploadsDir, asset.filename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    } catch {}
    return { success: true };
  }
}

import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import type { Prisma } from 'src/generated/prisma/client';
import {
  CreateAssetsTagDto,
  UpdateAssetsTagDto,
} from 'src/modules/assets/dtos/assets-tag.dto';
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
        assetsTags: { select: { id: true, name: true } },
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
          assetsTags: { select: { id: true, name: true } },
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
    // Return with tags for convenience
    return this.prisma.assets.findUnique({
      where: { id },
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
        assetsTags: { select: { id: true, name: true } },
      },
    });
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

  // ========== Tags CRUD ==========
  async listTags(userId: string, search?: string) {
    const role = await this.getUserRole(userId);
    const where: Prisma.AssetsTagWhereInput = {};
    if (role !== Role.Admin) (where as any).userId = userId;
    if (search) where.name = { contains: search, mode: 'insensitive' } as any;
    return this.prisma.assetsTag.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true },
    });
  }

  async createTag(userId: string, dto: CreateAssetsTagDto) {
    try {
      const created = await this.prisma.assetsTag.create({
        data: { name: dto.name.trim(), userId },
        select: { id: true, name: true },
      });
      return created;
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Tag name already exists');
      }
      throw e;
    }
  }

  async updateTag(userId: string, id: string, dto: UpdateAssetsTagDto) {
    const role = await this.getUserRole(userId);
    const existing = await this.prisma.assetsTag.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!existing) throw new NotFoundException('Tag not found');
    if (role !== Role.Admin && existing.userId !== userId)
      throw new ForbiddenException('Not allowed');
    try {
      return await this.prisma.assetsTag.update({
        where: { id },
        data: { name: dto.name.trim() },
        select: { id: true, name: true },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new ConflictException('Tag name already exists');
      }
      throw e;
    }
  }

  async deleteTag(userId: string, id: string) {
    const role = await this.getUserRole(userId);
    const existing = await this.prisma.assetsTag.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });
    if (!existing) throw new NotFoundException('Tag not found');
    if (role !== Role.Admin && existing.userId !== userId)
      throw new ForbiddenException('Not allowed');
    await this.prisma.assetsTag.delete({ where: { id } });
    return { success: true };
  }

  // Attach multiple tags (by tag IDs) to an asset owned by user (admin can attach any)
  async attachTags(userId: string, assetId: string, tagIds: string[]) {
    if (!tagIds?.length) return this.getById(userId, assetId);
    const role = await this.getUserRole(userId);
    const asset = await this.prisma.assets.findUnique({
      where: { id: assetId },
      select: { id: true, userId: true },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    if (role !== Role.Admin && asset.userId !== userId)
      throw new ForbiddenException('Not allowed');
    // Ensure tags belong to user (unless admin)
    if (role !== Role.Admin) {
      const count = await this.prisma.assetsTag.count({
        where: { id: { in: tagIds }, userId },
      });
      if (count !== tagIds.length)
        throw new ForbiddenException('Some tags not owned by user');
    }
    await this.prisma.assets.update({
      where: { id: assetId },
      data: {
        assetsTags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
      select: { id: true },
    });
    return this.getById(userId, assetId);
  }

  async detachTag(userId: string, assetId: string, tagId: string) {
    const role = await this.getUserRole(userId);
    const asset = await this.prisma.assets.findUnique({
      where: { id: assetId },
      select: { id: true, userId: true },
    });
    if (!asset) throw new NotFoundException('Asset not found');
    if (role !== Role.Admin && asset.userId !== userId)
      throw new ForbiddenException('Not allowed');
    await this.prisma.assets.update({
      where: { id: assetId },
      data: { assetsTags: { disconnect: { id: tagId } } },
      select: { id: true },
    });
    return this.getById(userId, assetId);
  }
}

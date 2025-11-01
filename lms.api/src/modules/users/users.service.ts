import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from 'src/databases/prisma.service';
import type { Prisma } from 'src/generated/prisma/client';
import { Role } from 'src/modules/auth/constants/roles.enum';
import { BanUserDto } from 'src/modules/users/dtos/ban-user.dto';
import { CreateUserDto } from 'src/modules/users/dtos/create-user.dto';
import { ListUsersDto } from 'src/modules/users/dtos/list-users.dto';
import { UpdateUserDto } from 'src/modules/users/dtos/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async createUser(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) throw new ConflictException('Email already exists');

    const passwordHash = await bcrypt.hash(dto.password, 10);
    return this.prisma.user.create({
      data: {
        email: dto.email,
        password: passwordHash,
        name: dto.name,
        image: dto.image,
        role: dto.role ?? 'student',
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async updateUser(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    let password: string | undefined;
    if (dto.password) password = await bcrypt.hash(dto.password, 10);

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email ?? undefined,
        password: password ?? undefined,
        name: dto.name ?? undefined,
        image: dto.image ?? undefined,
        role: dto.role ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return updated;
  }

  async deleteUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.prisma.user.delete({ where: { id } });
    return { success: true };
  }

  async banUser(id: string, dto: BanUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    const banExpires = dto.until ? new Date(dto.until) : null;
    return this.prisma.user.update({
      where: { id },
      data: { banned: true, banReason: dto.reason ?? null, banExpires },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async unbanUser(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({
      where: { id },
      data: { banned: false, banReason: null, banExpires: null },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        banned: true,
        banReason: true,
        banExpires: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  async listUsers(query: ListUsersDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const whereAnd: Prisma.UserWhereInput[] = [];

    if (query.search) {
      whereAnd.push({
        OR: [
          { email: { contains: query.search, mode: 'insensitive' } },
          { name: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }
    if (query.name)
      whereAnd.push({ name: { contains: query.name, mode: 'insensitive' } });
    if (query.email)
      whereAnd.push({ email: { contains: query.email, mode: 'insensitive' } });
    if (query.role) whereAnd.push({ role: query.role });
    if (typeof query.banned === 'boolean')
      whereAnd.push({ banned: query.banned });
    if (query.excludeAdmins === true) {
      // exclude admin role
      whereAnd.push({ NOT: { role: Role.Admin } });
    }

    const where: Prisma.UserWhereInput = whereAnd.length
      ? { AND: whereAnd }
      : {};

    const orderBy: Prisma.UserOrderByWithRelationInput = {
      [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc',
    } as Prisma.UserOrderByWithRelationInput;

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          image: true,
          role: true,
          banned: true,
          banReason: true,
          banExpires: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }
}

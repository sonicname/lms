import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/databases/prisma.service';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';

@Injectable()
export class ProfilesService {
  constructor(private readonly prisma: PrismaService) {}

  private select() {
    return {
      id: true,
      firstName: true,
      lastName: true,
      address: true,
      phone: true,
      bio: true,
      userId: true,
      createdAt: true,
      updatedAt: true,
    } as const;
  }

  async getById(id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      select: this.select(),
    });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async getByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
      select: this.select(),
    });
  }

  async createForUser(userId: string, dto: CreateProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (existing) throw new ConflictException('Profile already exists');
    return this.prisma.profile.create({
      data: { userId, ...dto },
      select: this.select(),
    });
  }

  async upsertForUser(
    userId: string,
    dto: CreateProfileDto | UpdateProfileDto,
  ) {
    return this.prisma.profile.upsert({
      where: { userId },
      update: { ...dto },
      create: { userId, ...(dto as Omit<CreateProfileDto, 'userId'>) },
      select: this.select(),
    });
  }

  async update(id: string, dto: UpdateProfileDto) {
    const existing = await this.prisma.profile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Profile not found');
    return this.prisma.profile.update({
      where: { id },
      data: { ...dto },
      select: this.select(),
    });
  }

  async updateByUserId(userId: string, dto: UpdateProfileDto) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!existing) throw new NotFoundException('Profile not found');
    return this.prisma.profile.update({
      where: { userId },
      data: { ...dto },
      select: this.select(),
    });
  }

  async remove(id: string) {
    const existing = await this.prisma.profile.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Profile not found');
    await this.prisma.profile.delete({ where: { id } });
    return { success: true };
  }

  async removeByUserId(userId: string) {
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });
    if (!existing) throw new NotFoundException('Profile not found');
    await this.prisma.profile.delete({ where: { userId } });
    return { success: true };
  }
}

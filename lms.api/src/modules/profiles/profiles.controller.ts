import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminOnly } from 'src/modules/auth/constants/roles.decorator';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { MeCreateProfileDocs } from './docs/me-create.docs';
import { MeDeleteProfileDocs } from './docs/me-delete.docs';
import { MeGetProfileDocs } from './docs/me-get.docs';
import { MeUpdateProfileDocs } from './docs/me-update.docs';
import { MeUpsertProfileDocs } from './docs/me-upsert.docs';
import { CreateProfileDto } from './dtos/create-profile.dto';
import { UpdateProfileDto } from './dtos/update-profile.dto';
import { ProfilesService } from './profiles.service';

@Controller('profiles')
@ApiTags('Profiles')
@UseGuards(JwtCookieAuthGuard)
@ApiCookieAuth('access_token')
export class ProfilesController {
  constructor(private readonly profiles: ProfilesService) {}

  // Get current user's profile (or null if none)
  @Get('me')
  @MeGetProfileDocs()
  async me(@Req() req: Request & { user?: { id: string } }) {
    const userId = req.user!.id;
    return this.profiles.getByUserId(userId);
  }

  // Create profile for current user (fails if exists)
  @Post('me')
  @MeCreateProfileDocs()
  async createMine(
    @Req() req: Request & { user?: { id: string } },
    @Body() dto: CreateProfileDto,
  ) {
    return this.profiles.createForUser(req.user!.id, dto);
  }

  // Upsert (create or update) current user's profile
  @Post('me/upsert')
  @MeUpsertProfileDocs()
  async upsertMine(
    @Req() req: Request & { user?: { id: string } },
    @Body() dto: CreateProfileDto,
  ) {
    return this.profiles.upsertForUser(req.user!.id, dto);
  }

  // Update current user's profile (must exist)
  @Patch('me')
  @MeUpdateProfileDocs()
  async updateMine(
    @Req() req: Request & { user?: { id: string } },
    @Body() dto: UpdateProfileDto,
  ) {
    return this.profiles.updateByUserId(req.user!.id, dto);
  }

  // Delete current user's profile
  @Delete('me')
  @MeDeleteProfileDocs()
  async deleteMine(@Req() req: Request & { user?: { id: string } }) {
    return this.profiles.removeByUserId(req.user!.id);
  }

  // Admin/extended endpoints could be added later (e.g., by id)
  @Get(':id')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  async getById(@Param('id') id: string) {
    return this.profiles.getById(id);
  }

  @Patch(':id')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  async updateById(@Param('id') id: string, @Body() dto: UpdateProfileDto) {
    return this.profiles.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  async deleteById(@Param('id') id: string) {
    return this.profiles.remove(id);
  }
}

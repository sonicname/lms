import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { AdminOnly } from 'src/modules/auth/constants/roles.decorator';
import { JwtCookieAuthGuard } from 'src/modules/auth/guards/jwt-cookie.guard';
import { RolesGuard } from 'src/modules/auth/guards/roles.guard';
import { AdminPingDocs } from 'src/modules/users/docs/admin-ping.docs';
import { BanUserDocs } from 'src/modules/users/docs/ban-user.docs';
import { CreateUserDocs } from 'src/modules/users/docs/create-user.docs';
import { DeleteUserDocs } from 'src/modules/users/docs/delete-user.docs';
import { GetMeDocs } from 'src/modules/users/docs/get-me.docs';
import { ListNonAdminUsersDocs } from 'src/modules/users/docs/list-non-admin-users.docs';
import { ListUsersDocs } from 'src/modules/users/docs/list-users.docs';
import { UnbanUserDocs } from 'src/modules/users/docs/unban-user.docs';
import { UpdateUserDocs } from 'src/modules/users/docs/update-user.docs';
import { BanUserDto } from 'src/modules/users/dtos/ban-user.dto';
import { CreateUserDto } from 'src/modules/users/dtos/create-user.dto';
import { ListUsersDto } from 'src/modules/users/dtos/list-users.dto';
import { UpdateUserDto } from 'src/modules/users/dtos/update-user.dto';
import { UsersService } from 'src/modules/users/users.service';

@Controller('users')
@ApiTags('Users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @UseGuards(JwtCookieAuthGuard)
  @GetMeDocs()
  async me(@Req() req: Request & { user?: { id: string } }) {
    const id = req.user?.id;
    return this.usersService.getProfile(id!);
  }

  // Example admin-only endpoint
  @Get('admin/ping')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  @AdminPingDocs()
  async adminPing() {
    return { ok: true };
  }

  // Admin: create user
  @Post()
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  @CreateUserDocs()
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.createUser(dto);
  }

  // Admin: list users
  @Get()
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  @ListUsersDocs()
  async list(@Query() query: ListUsersDto) {
    return this.usersService.listUsers(query);
  }

  // Admin: list only teachers and students (exclude admins)
  @Get('non-admins')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  @ListNonAdminUsersDocs()
  async listNonAdmins(@Query() query: ListUsersDto) {
    const effective = { ...query, excludeAdmins: true } as ListUsersDto;
    return this.usersService.listUsers(effective);
  }

  // Admin: update user
  @Patch(':id')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  @UpdateUserDocs()
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.updateUser(id, dto);
  }

  // Admin: delete user
  @Delete(':id')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  @DeleteUserDocs()
  async remove(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  // Admin: ban user
  @Post(':id/ban')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  @BanUserDocs()
  async ban(@Param('id') id: string, @Body() dto: BanUserDto) {
    return this.usersService.banUser(id, dto);
  }

  // Admin: unban user
  @Post(':id/unban')
  @UseGuards(JwtCookieAuthGuard, RolesGuard)
  @AdminOnly()
  @UnbanUserDocs()
  async unban(@Param('id') id: string) {
    return this.usersService.unbanUser(id);
  }
}

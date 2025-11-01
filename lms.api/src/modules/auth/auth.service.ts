import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { randomBytes, randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { PrismaService } from 'src/databases/prisma.service';
import { RefreshTokenDto } from 'src/modules/auth/dtos/refresh-token.dto';
import { RevokeTokenDto } from 'src/modules/auth/dtos/revoke-token.dto';
import { SignInDto } from 'src/modules/auth/dtos/sign-in.dto';
import { SignUpDto } from 'src/modules/auth/dtos/sign-up.dto';

type Tokens = {
  accessToken: string;
  accessTokenExpiresIn: number; // seconds
  refreshToken: string;
  refreshTokenExpiresAt: string; // ISO date
};

type PublicUser = {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: number; // seconds
  private readonly jwtRefreshSecret: string;
  private readonly jwtRefreshExpiresIn: number; // seconds

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {
    this.jwtSecret = this.config.get<string>('JWT_SECRET', 'change-me');
    this.jwtExpiresIn = Number(this.config.get<number>('JWT_EXPIRES_IN', 900));
    this.jwtRefreshSecret = this.config.get<string>(
      'JWT_REFRESH_SECRET',
      'change-me-refresh',
    );
    this.jwtRefreshExpiresIn = Number(
      this.config.get<number>('JWT_REFRESH_EXPIRES_IN', 60 * 60 * 24 * 7),
    );
  }

  async signUp(payload: SignUpDto) {
    const { email, name, password, image, rememberMe } = payload;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email is already registered');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
      data: {
        password: passwordHash,
        email,
        name,
        image: image ?? null,
        role: 'student',
      },
    });

    const tokens = await this.issueTokens(user.id, rememberMe === true);
    return this.buildAuthResponse(user, tokens);
  }

  async signIn(payload: SignInDto) {
    const { email, password, rememberMe } = payload;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const tokens = await this.issueTokens(user.id, rememberMe === true);
    return this.buildAuthResponse(user, tokens);
  }

  async refreshToken(payload: RefreshTokenDto) {
    const { refreshToken } = payload;
    const session = await this.prisma.session.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });
    if (!session) throw new UnauthorizedException('Invalid refresh token');

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      // Expired -> cleanup and reject
      await this.prisma.session.delete({ where: { id: session.id } });
      throw new UnauthorizedException('Refresh token expired');
    }

    // Rotate token: create new session and delete old one
    await this.prisma.session.delete({ where: { id: session.id } });
    const tokens = await this.issueTokens(session.userId, /*remember*/ true);
    return this.buildAuthResponse(session.user as any, tokens);
  }

  async revokeToken(payload: RevokeTokenDto) {
    const { refreshToken } = payload;
    const found = await this.prisma.session.findUnique({
      where: { token: refreshToken },
    });
    if (found) {
      await this.prisma.session.delete({ where: { id: found.id } });
    }
  }

  private async issueTokens(
    userId: string,
    remember: boolean,
  ): Promise<Tokens> {
    const accessToken = jwt.sign({ sub: userId }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    });

    // We store refresh token server-side in DB sessions table
    const sessionToken = this.generateSessionToken();
    const refreshTtl = remember
      ? this.jwtRefreshExpiresIn
      : this.jwtRefreshExpiresIn; // same for now
    const refreshExpiresAt = new Date(Date.now() + refreshTtl * 1000);

    await this.prisma.session.create({
      data: {
        id: randomUUID(),
        token: sessionToken,
        expiresAt: refreshExpiresAt,
        userId,
      },
    });

    return {
      accessToken,
      accessTokenExpiresIn: this.jwtExpiresIn,
      refreshToken: sessionToken,
      refreshTokenExpiresAt: refreshExpiresAt.toISOString(),
    };
  }

  private generateSessionToken(): string {
    // 48 bytes ~ 64 chars base64url
    const b64 = randomBytes(48).toString('base64');
    return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }

  private buildAuthResponse(user: any, tokens: Tokens) {
    const publicUser: PublicUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
    return { user: publicUser, tokens };
  }
}

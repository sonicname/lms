import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { AuthService } from 'src/modules/auth/auth.service';
import { RefreshTokenDocs } from 'src/modules/auth/docs/refresh-token.docs';
import { RevokeTokenDocs } from 'src/modules/auth/docs/revoke-token.docs';
import { SignInDocs } from 'src/modules/auth/docs/sign-in.docs';
import { SignUpDocs } from 'src/modules/auth/docs/sign-up.docs';
import { RefreshTokenDto } from 'src/modules/auth/dtos/refresh-token.dto';
import { RevokeTokenDto } from 'src/modules/auth/dtos/revoke-token.dto';
import { SignInDto } from 'src/modules/auth/dtos/sign-in.dto';
import { SignUpDto } from 'src/modules/auth/dtos/sign-up.dto';
import { clearAuthCookies, setAuthCookies } from 'src/utils/cookies';

@Controller('auth')
@ApiTags('Authentication')
export class AppAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  @Post('sign-in')
  @SignInDocs()
  async signIn(
    @Body() payload: SignInDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password, callbackURL, rememberMe } = payload;

    const result = await this.authService.signIn({
      email,
      password,
      callbackURL,
      rememberMe,
    });
    setAuthCookies(res, result.tokens, this.config);
    return result;
  }

  @Post('sign-up')
  @SignUpDocs()
  async signUp(
    @Body() payload: SignUpDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, name, password, callbackURL, rememberMe, image } = payload;

    const result = await this.authService.signUp({
      email,
      name,
      password,
      callbackURL,
      rememberMe,
      image,
    });
    setAuthCookies(res, result.tokens, this.config);
    return result;
  }

  @Post('refresh-token')
  @RefreshTokenDocs()
  async refresh(
    @Body() payload: RefreshTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = payload?.refreshToken || req.cookies?.['refresh_token'];
    if (!token) throw new UnauthorizedException('Missing refresh token');
    const result = await this.authService.refreshToken({ refreshToken: token });
    setAuthCookies(res, result.tokens, this.config);
    return result;
  }

  @Post('revoke-token')
  @RevokeTokenDocs()
  async revoke(
    @Body() payload: RevokeTokenDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const token = payload?.refreshToken || req.cookies?.['refresh_token'];
    if (!token) throw new UnauthorizedException('Missing refresh token');
    await this.authService.revokeToken({ refreshToken: token });
    clearAuthCookies(res, this.config);
    return { success: true };
  }
}

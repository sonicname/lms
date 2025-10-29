import { Controller, Post } from '@nestjs/common';
import { AppAuthService } from 'src/modules/auth/auth.service';

@Controller('auth')
export class AppAuthController {
  constructor(private readonly authService: AppAuthService) {}

  @Post('sign-in')
  async signIn(
    email: string,
    password: string,
    callbackURL?: string,
    rememberMe?: boolean,
  ) {
    return this.authService.signIn({
      email,
      password,
      callbackURL,
      rememberMe,
    });
  }
}

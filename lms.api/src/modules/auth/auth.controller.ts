import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AppAuthService } from 'src/modules/auth/auth.service';
import { SignInDocs } from 'src/modules/auth/docs/sign-in.docs';
import { SignUpDocs } from 'src/modules/auth/docs/sign-up.docs';
import { SignInDto } from 'src/modules/auth/dtos/sign-in.dto';
import { SignUpDto } from 'src/modules/auth/dtos/sign-up.dto';

@Controller('auth')
@ApiTags('Authentication')
export class AppAuthController {
  constructor(private readonly authService: AppAuthService) {}

  @Post('sign-in')
  @SignInDocs()
  async signIn(@Body() payload: SignInDto) {
    const { email, password, callbackURL, rememberMe } = payload;

    return this.authService.signIn({
      email,
      password,
      callbackURL,
      rememberMe,
    });
  }

  @Post('sign-up')
  @SignUpDocs()
  async signUp(@Body() payload: SignUpDto) {
    const { email, name, password, callbackURL, rememberMe, image } = payload;

    return this.authService.signUp({
      email,
      name,
      password,
      callbackURL,
      rememberMe,
      image,
    });
  }
}

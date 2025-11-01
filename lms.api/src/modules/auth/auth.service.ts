import { Injectable } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { SignInDto } from 'src/modules/auth/dtos/sign-in.dto';
import { SignUpDto } from 'src/modules/auth/dtos/sign-up.dto';
import { auth } from 'src/utils/auth';

@Injectable()
export class AppAuthService {
  constructor(private readonly authService: AuthService<typeof auth>) {}

  signIn(payload: SignInDto) {
    return this.authService.api.signInEmail({
      body: {
        email: payload.email,
        password: payload.password,
        callbackURL: payload.callbackURL,
        rememberMe: payload.rememberMe,
      },
    });
  }

  signUp(payload: SignUpDto) {
    return this.authService.api.signUpEmail({
      body: {
        email: payload.email,
        name: payload.name,
        password: payload.password,
        callbackURL: payload.callbackURL,
        rememberMe: payload.rememberMe,
        image: payload.image,
      },
    });
  }
}

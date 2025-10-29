import { Injectable } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import { auth } from 'src/utils/auth';

@Injectable()
export class AppAuthService {
  constructor(private readonly authService: AuthService<typeof auth>) {}

  signIn(payload: {
    email: string;
    password: string;
    callbackURL?: string | undefined;
    rememberMe?: boolean | undefined;
  }) {
    return this.authService.api.signInEmail({
      body: {
        email: payload.email,
        password: payload.password,
        callbackURL: payload.callbackURL,
        rememberMe: payload.rememberMe,
      },
    });
  }
}

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@thallesp/nestjs-better-auth';
import { AppAuthModule } from 'src/modules/auth/auth.module';
import { auth } from 'src/utils/auth';
import { validate } from 'src/utils/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    AuthModule.forRoot({
      auth,
      disableGlobalAuthGuard: true,
    }),
    AppAuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

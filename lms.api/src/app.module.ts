import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppAuthModule } from 'src/modules/auth/auth.module';
import { UsersModule } from 'src/modules/users/users.module';
import { validate } from 'src/utils/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    AppAuthModule,
    UsersModule,
  ],
})
export class AppModule {}

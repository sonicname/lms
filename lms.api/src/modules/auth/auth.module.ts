import { Module } from '@nestjs/common';
import { AppAuthController } from 'src/modules/auth/auth.controller';
import { AppAuthService } from 'src/modules/auth/auth.service';

@Module({
  imports: [],
  controllers: [AppAuthController],
  providers: [AppAuthService],
})
export class AppAuthModule {}

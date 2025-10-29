import { Module } from '@nestjs/common';
import { AppAuthService } from 'src/modules/auth/auth.service';

@Module({
  imports: [],
  controllers: [],
  providers: [AppAuthService],
})
export class AppAuthModule {}

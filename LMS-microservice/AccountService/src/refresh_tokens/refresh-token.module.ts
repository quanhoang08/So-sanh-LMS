// src/refresh_tokens/refresh-token.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshTokenController } from './refresh-token.controller';
import { RefreshTokenService } from './refresh-token.service';
import { RefreshToken } from './refresh-token.entity';
import { RefreshTokenRepository } from './refresh-token.repository';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    AuthModule,
    UserModule
  ],
  controllers: [RefreshTokenController],
  providers: [RefreshTokenService, RefreshTokenRepository],
  exports: [RefreshTokenService, RefreshTokenRepository],
})
export class RefreshTokenModule {
  constructor() {
    console.log('📦 RefreshTokenModule loaded with:');
    console.log('   - Controller: RefreshTokenController');
    console.log('   - Service: RefreshTokenService');
    console.log('   - Repository: RefreshTokenRepository');
  }
}
import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { PasswordResetController } from "./password-reset.controller";
import { PasswordReset } from "./password-reset.entity";
import { PasswordResetRepository } from "./password-reset.repository";
import { PasswordResetService } from "./password-reset.service";
import { UserModule } from "../user/user.module";
import { UserRepository } from "../user/user.repository";

@Module({
  imports: [TypeOrmModule.forFeature([PasswordReset]), 
  AuthModule,
  UserModule
],
  controllers: [PasswordResetController],
  providers: [PasswordResetService, PasswordResetRepository, UserRepository],
  exports: [PasswordResetService],
})
export class PasswordResetModule {}
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';

// Feature modules
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AdminModule } from './admin/admin.module';
import { PasswordResetModule } from './password_resets/password-reset.module';
import { RefreshTokenModule } from './refresh_tokens/refresh-token.module';
import { AuditLogModule } from './audit_logs/audit-log.module';

// Entities
import { User } from './user/user.entity';
import { PasswordReset } from './password_resets/password-reset.entity';
import { RefreshToken } from './refresh_tokens/refresh-token.entity';
import { AuditLog } from './audit_logs/audit-log.entity';

// Controllers & Services
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserProvider } from './user/user-provider.entity';

@Module({
  imports: [
    // ========================================
    // 1. GLOBAL CONFIG
    // ========================================
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // ========================================
    // 2. DATABASE CONNECTION
    // ========================================
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME') || 'postgres',
        password: configService.get<string>('DB_PASSWORD') || 'your_password',
        database: configService.get<string>('DB_NAME') || 'accounts_db',
        entities: [User, UserProvider, PasswordReset, RefreshToken, AuditLog],
        synchronize: false,
      }),
    }),

    // ========================================
    // 3. GLOBAL JWT (optional - also in AuthModule)
    // ========================================
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService): JwtModuleOptions => ({
        secret: configService.get<string>('JWT_SECRET') || 'fallback_secret_key',
        signOptions: {
          expiresIn: (configService.get<string>('JWT_EXPIRES_IN') || '1d') as any,
        },
      }),
    }),

    // ========================================
    // 4. COMMON UTILITIES (filters, interceptors)
    // ========================================
    CommonModule,

    // ========================================
    // 5. AUTH MODULE (guards, strategies)
    // ========================================
    AuthModule,

    // ========================================
    // 6. FEATURE MODULES
    // ========================================
    UserModule,
    AdminModule,
    PasswordResetModule,
    RefreshTokenModule,
    AuditLogModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private configService: ConfigService) {
    console.log(`
╔════════════════════════════════════════╗
║   🚀 ACCOUNT SERVICE MODULES LOADED    ║
╠════════════════════════════════════════╣
║   ✅ CommonModule (filters, logs)      ║
║   ✅ AuthModule (JWT, guards)          ║
║   ✅ UserModule (register, login)      ║
║   ✅ AdminModule (management)          ║
║   ✅ PasswordResetModule               ║
║   ✅ RefreshTokenModule                ║
║   ✅ AuditLogModule                    ║
╚════════════════════════════════════════╝
    `);
  }
}
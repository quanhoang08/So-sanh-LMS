import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Import các Feature Modules
import { CourseModule } from './course/course.module';
import { MaterialModule } from './material/material.module.';
import { AppMessageController } from './app.message.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { SupabaseModule } from './supabase/supabase.module';
import { LessonModule } from './lesson/lesson.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => {
        console.log("🔥 DB CONFIG:", {
          host: configService.get('DB_HOST'),
          db: configService.get('DB_DATABASE'),
          user: configService.get('DB_USERNAME'),
        });

        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_DATABASE'),
          autoLoadEntities: true,
          synchronize: false,
        };
      }
    }),

    // Đăng ký các Module con vào App chính
    CourseModule,
    MaterialModule,
    SupabaseModule,
    LessonModule

  ],
  controllers: [],
})
export class AppModule { }
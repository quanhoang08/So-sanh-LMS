import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './course.entity';
import { CourseService } from './course.service';
import { CourseController } from './course.controller';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from '../auth/strategies/jwt.strategy';
import { AppMessageController } from '../app.message.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { LessonModule } from '../lesson/lesson.module';
import { MaterialModule } from '../material/material.module.';
import { Lesson } from '../lesson/lesson.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Course, Lesson]),
    PassportModule,
    MaterialModule,
    ClientsModule.register([
      {
        name: 'ACADEMIC_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'user_created_queue', // 👈 dùng queue của academic
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET, // mới thêm hôm 22/04/2026
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [CourseController, AppMessageController],
  providers: [CourseService, JwtStrategy],
  exports: [TypeOrmModule] // Export để các module khác có thể dùng Repository của Course nếu cần
})
export class CourseModule { }
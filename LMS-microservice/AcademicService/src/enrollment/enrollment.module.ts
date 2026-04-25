// src/enrollment/enrollment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Enrollment } from './enrollment.entity';
import { EnrollmentRepository } from './enrollment.repository';
import { EnrollmentController } from './enrollment.controller';
import { EnrollmentService } from './enrollment.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { StudentModule } from '../student/student.module';
import { AppMessageController } from '../app.message.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Enrollment]),
    StudentModule,
    ClientsModule.register([
      {
        name: 'COURSE_SERVICE', // Phải khớp 100% với tên bạn ghi trong @Inject()
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'course_queue', // Thay bằng tên queue thực tế mà Course Service đang lắng nghe
          queueOptions: {
            durable: false,
          },
        },
      },
    ]),
  ],
  controllers: [
    EnrollmentController, 
    // AppMessageController
  ],
  providers: [
    EnrollmentRepository,
    EnrollmentService, 
    
  ],
  exports: [EnrollmentService, EnrollmentRepository], // Export để các Module khác (như Assignment) có thể dùng
})
export class EnrollmentModule {}
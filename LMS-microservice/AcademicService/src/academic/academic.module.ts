// src/assignment/academic-assignment.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AcademicAssignmentService } from './academic-assign.service';
import { AcademicAssignmentController } from './academic-assign.controller';
import { StudentModule } from '../student/student.module'; // Import StudentModule để dùng Repo
import { Enrollment } from '../enrollment/enrollment.entity';
import { AssignedLecturer } from '../assign-lecturer/assign-lecturer.entity';
import { EnrollmentRepository } from '../enrollment/enrollment.repository';
import { AssignedLecturerRepository } from '../assign-lecturer/assign-lecturer.repository';
import { EnrollmentModule } from '../enrollment/enrollment.module';
import { AssignedLecturerModule } from '../assign-lecturer/assign-lecturer.module';
import { LecturerModule } from '../lecturer/lecturer.module';

@Module({
  imports: [
    // 1. Đăng ký Entity của riêng Module này
    TypeOrmModule.forFeature([Enrollment, AssignedLecturer]),
    // 2. Import StudentModule để lấy StudentRepository mà AssignmentService đang cần
    StudentModule,    // Để AcademicAssignmentService gọi được StudentRepository
    EnrollmentModule, 
    AssignedLecturerModule,
    LecturerModule,
  ],
  controllers: [AcademicAssignmentController],
  providers: [
    AcademicAssignmentService,
    EnrollmentRepository,
    AssignedLecturerRepository,
    
  ],
  exports: [AcademicAssignmentService],
})
export class AcademicAssignmentModule {}
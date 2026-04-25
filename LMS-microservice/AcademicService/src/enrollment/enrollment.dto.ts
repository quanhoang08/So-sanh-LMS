import { IsNumber, IsNotEmpty } from 'class-validator';
import { Enrollment } from './enrollment.entity';

export class EnrollStudentDto {
  @IsNumber()
  @IsNotEmpty()
  studentId!: string;

  @IsNumber()
  @IsNotEmpty()
  courseId!: string; // ID từ module Curriculum
}

export class EnrollmentResponseDto {
  id!: number;
  studentId!: string;
  courseId!: string;
  enrollmentStatus!: string;
  enrolledAt!: Date;

  /**
   * Chuyển đổi từ Entity sang DTO để trả về cho Client
   * Đảm bảo tính đóng gói và lọc bỏ các dữ liệu không cần thiết
   */
  static fromEntity(entity: Enrollment): EnrollmentResponseDto {
    const dto = new EnrollmentResponseDto();
    dto.id = entity.id;
    dto.studentId = entity.studentId;
    dto.courseId = entity.courseId;
    dto.enrollmentStatus = entity.enrollmentStatus;
    dto.enrolledAt = entity.enrolledAt;
    return dto;
  }
}
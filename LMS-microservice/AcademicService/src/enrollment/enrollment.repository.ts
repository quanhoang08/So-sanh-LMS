import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';

@Injectable()
export class EnrollmentRepository extends Repository<Enrollment> {
  // Trong TypeORM v0.3+, khi extends Repository, bạn cần truyền target entity và EntityManager 
  // thông qua constructor như thế này:
  constructor(private dataSource: DataSource) {
    super(Enrollment, dataSource.createEntityManager());
  }

  // Đổi tên để không trùng với hàm mặc định remove()
  async removeEnrollment(studentId: string, courseId: string): Promise<void> {
    await this.delete({
      student: { id: studentId },
      // Lưu ý: Sửa 'id' thành 'course' hoặc 'courseId' tùy theo cách bạn map Entity. 
      // Ở file Course bạn để ID là UUID (string) nên courseId nên là kiểu string.
      courseId: courseId
    });
  }

  // Đổi tên để không trùng với hàm mặc định findOne()
  async findEnrollment(studentId: string, courseId: string): Promise<Enrollment | null> {
    // Sử dụng thẳng this.findOne, không dùng this.repo
    return this.findOne({
      where: {
        studentId: studentId,
        courseId: courseId
      }
    });
  }

  // Ví dụ hàm save custom (không dùng tên 'save')
  async createEnrollment(enrollment: Enrollment): Promise<Enrollment> {
    return this.save(enrollment);
  }
}
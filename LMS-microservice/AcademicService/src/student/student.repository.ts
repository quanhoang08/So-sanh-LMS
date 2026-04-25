import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from './student.entity';
import { StudentStatus } from './student.enum';

@Injectable()
export class StudentRepository {
  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) { }

    // Tìm sinh viên với id cho trước
  findOne(id: string): Promise<Student | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['enrollments'],
    });
  }
  // Tìm kiếm sinh viên kèm theo các lớp đã đăng ký
  async findStudentWithEnrollments(id: string): Promise<Student | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['enrollments'],
    });
  }

  async create(data: {
    id: string;
    email: string;
    studentCode?: string;
    fullname?: string;
    status?: StudentStatus;
    phone?: string
  }) {
    // 1. Khởi tạo instance từ class Student
    const newStudent = this.repo.create({
      id: data.id,
      email: data.email,
      fullname: data.fullname,
      phone: data.phone,
      status: data.status || StudentStatus.ENROLLED,
      studentCode: data.studentCode,
    });

    // 2. Lưu vào database và trả về kết quả
    return await this.repo.save(newStudent);
  }
  // Hàm mới thêm vào
  async updateStatus(id: string, status: string): Promise<void> {
    await this.repo.update(id, { status: status as any });
  }
  async findByUserId(id: number): Promise<Student | null> {
    return this.repo.findOne({
      where: { userId: id }
    });
  }
  async findByStudentId(id: string): Promise<Student | null> {
    return this.repo.findOne({ where: { id } });
  }
  // Thỏa mãn: Xem danh sách toàn bộ học viên
  async findAll(): Promise<Student[] | null> {
    return this.repo.find();
  }

  // Thỏa mãn: Xem danh sách học viên thuộc một khóa học cụ thể
  async findByCourseId(courseId: number): Promise<Student[] | null> {
    return this.repo.find({
      where: {
        enrollments: { id: courseId }
      },
      relations: ['enrollments'],
    });
  }

  async save(student: Student): Promise<Student | null> {
    return this.repo.save(student);
  }

  async delete(userId: number) {
    return this.repo.delete(userId);
  }

  async findByEmail(email: string): Promise<Student | null> {
    return this.repo.findOne({ where: { email } });
  }
}
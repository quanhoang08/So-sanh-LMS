import { Entity, Column, CreateDateColumn, UpdateDateColumn, OneToMany, PrimaryColumn } from 'typeorm';
import { Material } from '../material/material.entity';
import { CourseStatus } from './course.enum';
import { Lesson } from '../lesson/lesson.entity';

@Entity('course')
export class Course {
  @PrimaryColumn({ type: 'varchar' })
  id!: string;

  @Column()
  title!: string;

  @Column({ type: 'text', nullable: true })
  description: string | undefined;

  // Lưu ID của Giảng viên (từ Microservice User)
  @Column()
  instructorId!: string;

  // Thêm vào class Course
  @Column({ type: 'enum', enum: CourseStatus, default: CourseStatus.PENDING })
  status!: CourseStatus; // 'Dự kiến mở' | 'Đã mở đăng ký' | 'Đã hủy' | 'Đã đóng'

  // Mối quan hệ: 1 Course có nhiều Material
  @OneToMany(() => Material, (material) => material.course, { cascade: true })
  materials!: Material[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Lesson, (lesson) => lesson.course, { cascade: true })
  lessons!: Lesson[];
}
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Student } from '../student/student.entity';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'student_id', type: 'uuid' })
  studentId!: string;

  @ManyToOne(() => Student, (student) => student.enrollments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student!: Student;

  @Column({ name: 'course_id', type: 'varchar' }) // nếu course cũng là uuid
  courseId!: string;

  @Column({ default: 'ACTIVE' })
  enrollmentStatus!: string; // ACTIVE, COMPLETED, WITHRAW, UNENROLLMENT (Đang học, đã hoàn thành, rút môn, chưa đăng ký)

  @CreateDateColumn({ type: 'timestamptz' })
  enrolledAt!: Date;
}
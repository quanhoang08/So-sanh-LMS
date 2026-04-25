import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Lecturer } from '../lecturer/lecturer.entity';

/**
 * Entity biểu diễn việc PHÂN CÔNG giảng viên vào một đối tượng học thuật (khóa học, đồ án, lớp học...)
 * 
 * ⚠️ KHÔNG phải là giảng viên chính của khóa học.
 * 
 * 📌 Phân biệt với Course.instructorId:
 * - instructorId: giảng viên CHÍNH / người tạo khóa học (1 course chỉ có 1)
 * - assigned_lecturers: danh sách giảng viên THAM GIA (có thể nhiều người)
 * 
 * 🎯 Mục đích:
 * - Hỗ trợ nhiều giảng viên trong 1 khóa học
 * - Gán vai trò cụ thể: giảng dạy, hướng dẫn, phản biện...
 * - Quản lý theo học kỳ (semester)
 * 
 * 📊 Ví dụ:
 * Course A:
 * - instructorId = Nguyễn Văn A (giảng viên chính)
 * - assigned_lecturers:
 *    + A → LECTURER
 *    + B → SUPERVISOR
 *    + C → REVIEWER
 * 
 * 👉 Vì vậy:
 * - instructorId = "owner"
 * - assigned_lecturers = "participants"
 */
@Entity('assigned_lecturers')
export class AssignedLecturer {
  @PrimaryGeneratedColumn('increment')
  id!: number;

  @Column({ name: 'lecturer_id' })
  lecturerId!: string; // Cho phép khai báo id của lecturer ngay cả khi đã chỉ định quan hệ

  @ManyToOne(() => Lecturer, (lecturer) => lecturer.assignments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lecturer_id' })
  lecturer!: Lecturer; 

  @Column({ name: 'target_id', type: 'uuid' })
  targetId!: string; // ID của Lớp học hoặc Đồ án cần phân công

  
  @Column({ length: 50 })
  assignmentRole!: string; // VD: 'LECTURER', 'SUPERVISOR' (Người hướng dẫn), 'REVIEWER' (Người phản biện)

  @Column({ length: 20 })
  semester!: string; // Học kỳ (VD: 2023.1)

  @CreateDateColumn({ type: 'timestamptz' })
  assignedAt!: Date;

  @Column({ name: 'course_id', type: 'varchar' })
  courseId!: string; // ID của khóa học bên module Curriculum


}
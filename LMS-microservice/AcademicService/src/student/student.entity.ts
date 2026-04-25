import { Entity, PrimaryColumn, Column, Index, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StudentStatus } from './student.enum';
import { Enrollment } from '../enrollment/enrollment.entity';

@Entity('students')
export class Student {
  // ID này không tự sinh ra ở đây, mà được copy từ ID của User (bên module Account & Security) truyền sang khi tạo mới.
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Index()
  @Column({ name: "user_id",type: 'integer', nullable: false })
  userId!: number;  // ✅ FK to User.id (AccountService)

  @Column({ length: 150 })
  fullname!: string;

  @Index()
  @Column({ length: 255, unique: true })
  email!: string;

  @Column({ length: 20, nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({ unique: true, length: 50 })
  studentCode!: string;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.UNENROLLED,
  }) // ❌ xóa AccountStatus (ở monolithic) vì không liên quan đến trạng thái học viên
  status!: StudentStatus;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => Enrollment, (enrollment) => enrollment.student)
  enrollments!: Enrollment[];

  // @OneToMany(() => Submission, (submission) => submission.student) 
  // submissions: Submission[]
  //  KHÔNG KHAI BÁO SUBMISSION Ở ĐÂY, trường này sẽ dc gọi api
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Quizz } from 'src/quizz/quizz.entity';

@Entity('submissions')
export class Submission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  studentId: string; // ID của học viên

  // Lưu các câu trả lời của học viên (Dùng cho trắc nghiệm)
  @Column({ type: 'jsonb', nullable: true })
  answers: any; 

  // Link file nộp (Dùng cho assignment tự luận)
  @Column({ nullable: true })
  fileUrl: string; 

  @Column({ type: 'float', nullable: true })
  score: number;

  @Column({ type: 'enum', enum: ['submitted', 'graded', 'regrade_requested', 'archived'], default: 'submitted' })
  status: string;

  @Column({ type: 'text', nullable: true })
  feedback: string;

  @ManyToOne(() => Quizz, (quizz) => quizz.submissions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizzId' })
  quizz: Quizz;

  @CreateDateColumn()
  submittedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
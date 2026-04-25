import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Course } from 'src/course/course.entity';
import { Question } from '../question/question.entity';
import { Submission } from 'src/submission/submission.entity';


@Entity('quizzes')
export class Quizz {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ type: 'enum', enum: ['quiz', 'assignment'], default: 'quiz' })
  type: string;

  @Column({ type: 'int', nullable: true })
  timeLimit: number; // Tính bằng phút, null nếu không giới hạn

  @Column({ type: 'float', default: 10 })
  maxScore: number;

  @Column({ type: 'float', default: 5 })
  passingScore: number;

  @Column()
  creatorId: string; // ID giảng viên tạo bài

  @ManyToOne(() => Course, (course) => course.quizzes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToMany(() => Question, (question) => question.quizz, { cascade: true })
  questions: Question[];

  @OneToMany(() => Submission, (submission) => submission.quizz)
  submissions: Submission[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
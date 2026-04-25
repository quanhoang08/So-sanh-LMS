import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Quizz } from 'src/quizz/quizz.entity';
@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'enum', enum: ['multiple_choice', 'true_false', 'short_answer'] })
  type: string;

  // Dùng kiểu jsonb của Postgres để lưu mảng các đáp án linh hoạt
  @Column({ type: 'jsonb', nullable: true })
  options: any; 

  @Column({ type: 'text' })
  correctAnswer: string;

  @Column({ type: 'float', default: 1 })
  points: number;

  // Ràng buộc CASCADE: Xóa Quizz là xóa sạch Question
  @ManyToOne(() => Quizz, (quizz) => quizz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizzId' })
  quizz: Quizz;
}
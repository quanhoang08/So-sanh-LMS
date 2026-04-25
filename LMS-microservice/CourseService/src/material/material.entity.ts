import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lesson } from '../lesson/lesson.entity';

@Entity('materials')
export class Material {
  @PrimaryGeneratedColumn('uuid')
  id!: string; // Thêm ! vì luôn có ID khi lưu vào DB

  @Column()
  name!: string; // Thêm !

  @Column()
  fileUrl!: string; // Thêm !

  @Column({ type: 'int', default: 0 })
  orderIndex!: number; // Thêm !

  // Với relation, bạn cũng thêm ! vì TypeORM sẽ load nó nếu bạn join
  @ManyToOne(() => Lesson, (lesson) => lesson.materials, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lesson_id' })
  course!: Lesson;

  @CreateDateColumn()
  createdAt!: Date; // Thêm !

}
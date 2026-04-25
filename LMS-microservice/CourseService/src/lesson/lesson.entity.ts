import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
} from 'typeorm';
import { Course } from '../course/course.entity';
import { Material } from '../material/material.entity';

@Entity('lessons')
export class Lesson {
    // DB: id BIGSERIAL PRIMARY KEY
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ length: 255 })
    title!: string;

    // DB: summary TEXT (nullable) — tóm tắt bài giảng
    @Column({ type: 'text', nullable: true })
    summary?: string;

    // DB: content TEXT (nullable)
    @Column({ type: 'text', nullable: true })
    content?: string;

    // DB: order_index INT NOT NULL DEFAULT 0
    @Column({ default: 0, name: 'order_index' })
    orderIndex!: number;

    @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
    updatedAt!: Date;

    @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'course_id' })
    course!: Course;

    @OneToMany(() => Material, (material) => material.course, { cascade: true })
    materials!: Material[];
}
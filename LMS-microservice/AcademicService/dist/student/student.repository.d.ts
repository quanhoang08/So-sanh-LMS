import { Repository } from 'typeorm';
import { Student } from './student.entity';
import { StudentStatus } from './student.enum';
export declare class StudentRepository {
    private readonly repo;
    findOne(id: string): Promise<Student | null>;
    constructor(repo: Repository<Student>);
    findStudentWithEnrollments(id: string): Promise<Student | null>;
    create(data: {
        id: string;
        email: string;
        studentCode?: string;
        fullname?: string;
        status?: StudentStatus;
        phone?: string;
    }): Promise<Student>;
    updateStatus(id: string, status: string): Promise<void>;
    findByUserId(id: number): Promise<Student | null>;
    findByStudentId(id: string): Promise<Student | null>;
    findAll(): Promise<Student[] | null>;
    findByCourseId(courseId: number): Promise<Student[] | null>;
    save(student: Student): Promise<Student | null>;
    delete(userId: number): Promise<import("typeorm").DeleteResult>;
    findByEmail(email: string): Promise<Student | null>;
}

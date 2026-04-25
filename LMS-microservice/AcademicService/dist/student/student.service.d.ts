import { Student } from "./student.entity";
import { StudentRepository } from "./student.repository";
import { UpdateStudentDto } from "./student.dto";
import { ClientProxy } from "@nestjs/microservices";
export declare class StudentService {
    private readonly studentRepo;
    private readonly rabbitClient;
    private readonly logger;
    constructor(studentRepo: StudentRepository, rabbitClient: ClientProxy);
    createFromAccount(data: {
        id: number;
        email: string;
        fullname?: string;
    }): Promise<Student>;
    getProfileByEmail(email: string): Promise<Student>;
    updateProfile(id: number, updateDto: UpdateStudentDto): Promise<Student>;
    patchUserId(studentId: string, userId: number): Promise<void>;
    getStudents(courseId?: number): Promise<Student[]>;
    findByEmail(email: string): Promise<Student | null>;
    handleRoleAssigned(data: {
        id: number;
        email: string;
    }): Promise<void>;
    deactivateStudent(studentId: number): Promise<void>;
    findByUserId(userId: number): Promise<Student | null>;
    findByStudentId(studentId: string): Promise<Student | null>;
    hardDelete(userId: number): Promise<{
        message: string;
    }>;
    createInitialProfile(userId: number, email: string): Promise<Student>;
}

import { Student } from './student.entity';
export declare class UpdateStudentDto {
    fullname?: string;
    phone?: string;
    avatarUrl?: string;
}
export declare class StudentResponseDto {
    id: string;
    fullname: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    studentCode: string;
    status: string;
    static fromEntity(entity: Student): StudentResponseDto;
}

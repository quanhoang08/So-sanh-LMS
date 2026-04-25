import { Enrollment } from './enrollment.entity';
export declare class EnrollStudentDto {
    studentId: string;
    courseId: string;
}
export declare class EnrollmentResponseDto {
    id: number;
    studentId: string;
    courseId: string;
    enrollmentStatus: string;
    enrolledAt: Date;
    static fromEntity(entity: Enrollment): EnrollmentResponseDto;
}

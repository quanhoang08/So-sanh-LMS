import { Student } from '../student/student.entity';
export declare class Enrollment {
    id: number;
    studentId: string;
    student: Student;
    courseId: string;
    enrollmentStatus: string;
    enrolledAt: Date;
}

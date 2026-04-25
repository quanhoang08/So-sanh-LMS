import { StudentStatus } from './student.enum';
import { Enrollment } from '../enrollment/enrollment.entity';
export declare class Student {
    id: string;
    userId: number;
    fullname: string;
    email: string;
    phone?: string;
    avatarUrl?: string;
    studentCode: string;
    status: StudentStatus;
    createdAt: Date;
    updatedAt: Date;
    enrollments: Enrollment[];
}

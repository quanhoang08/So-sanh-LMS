import { AssignedLecturer } from '../assign-lecturer/assign-lecturer.entity';
export declare class Lecturer {
    id: string;
    userId: number;
    fullname: string;
    email: string;
    lecturerCode: string;
    degree: string;
    department: string;
    createdAt: Date;
    updatedAt: Date;
    assignments: AssignedLecturer[];
    specialization: string;
    bio: string;
    status: string;
}

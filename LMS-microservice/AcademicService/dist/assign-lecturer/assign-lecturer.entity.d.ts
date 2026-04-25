import { Lecturer } from '../lecturer/lecturer.entity';
export declare class AssignedLecturer {
    id: number;
    lecturerId: string;
    lecturer: Lecturer;
    targetId: string;
    assignmentRole: string;
    semester: string;
    assignedAt: Date;
    courseId: string;
}

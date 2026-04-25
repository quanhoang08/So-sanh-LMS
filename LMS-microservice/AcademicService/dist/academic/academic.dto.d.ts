import { AssignedLecturer } from "../assign-lecturer/assign-lecturer.entity";
export declare class AssignedLecturerResponseDto {
    id: number;
    lecturerId: string;
    courseId: string;
    targetId?: string;
    assignmentRole: string;
    semester: string;
    assignedAt: Date;
    static fromEntity(entity: AssignedLecturer): AssignedLecturerResponseDto;
}

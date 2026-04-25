export declare enum AssignmentRole {
    PRIMARY = "PRIMARY_TEACHER",
    ASSISTANT = "ASSISTANT_TEACHER",
    REVIEWER = "REVIEWER"
}
export declare class AssignLecturerDto {
    lecturerId: string;
    courseId: string;
    role: AssignmentRole;
}

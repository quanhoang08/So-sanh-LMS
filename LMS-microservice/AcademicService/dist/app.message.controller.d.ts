import { StudentService } from './student/student.service';
import { LecturerService } from './lecturer/lecturer.service';
export declare class AppMessageController {
    private readonly studentService;
    private readonly lecturerService;
    private readonly logger;
    constructor(studentService: StudentService, lecturerService: LecturerService);
    handleUserCreated(data: {
        id: number;
        email: string;
        fullname?: string;
    }): Promise<void>;
    handleUserRoleChanged(data: {
        id: number;
        email: string;
        oldRole: string;
        newRole: string;
    }): Promise<void>;
    private syncLecturerData;
    private syncStudentData;
    getLecturers(ids: string[]): Promise<import("./lecturer/lecturer.entity").Lecturer[]>;
}

import { AcademicAssignmentService } from "./academic-assign.service";
import { AssignLecturerDto } from "../assign-lecturer/assign.dto";
import { EnrollmentResponseDto, EnrollStudentDto } from "../enrollment/enrollment.dto";
import { AssignedLecturerResponseDto } from "./academic.dto";
export declare class AcademicAssignmentController {
    private readonly assignmentService;
    constructor(assignmentService: AcademicAssignmentService);
    enrollStudent(dto: EnrollStudentDto): Promise<EnrollmentResponseDto>;
    unenroll(studentId: string, courseId: string): Promise<void>;
    assignLecturer(dto: AssignLecturerDto): Promise<AssignedLecturerResponseDto>;
}

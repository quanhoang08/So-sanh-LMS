import { StudentResponseDto, UpdateStudentDto } from "./student.dto";
import { StudentService } from "./student.service";
export declare class StudentController {
    private readonly studentService;
    constructor(studentService: StudentService);
    getMyProfile(email: string): Promise<StudentResponseDto>;
    updateMyProfile(id: number, updateDto: UpdateStudentDto): Promise<StudentResponseDto>;
    getStudents(courseId?: number): Promise<StudentResponseDto[]>;
}

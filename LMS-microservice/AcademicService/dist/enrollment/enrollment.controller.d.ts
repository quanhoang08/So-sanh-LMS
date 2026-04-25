import { EnrollmentService } from './enrollment.service';
import { StudentService } from '../student/student.service';
export declare class EnrollmentController {
    private readonly enrollmentService;
    private readonly studentService;
    constructor(enrollmentService: EnrollmentService, studentService: StudentService);
    getDashboardData(user: any): Promise<{
        registeredCourses: any;
        availableCourses: any;
    }>;
}

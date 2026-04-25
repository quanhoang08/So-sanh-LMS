import { OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { EnrollmentRepository } from './enrollment.repository';
export declare class EnrollmentService implements OnModuleInit {
    private readonly enrollmentRepository;
    private readonly courseClient;
    constructor(enrollmentRepository: EnrollmentRepository, courseClient: ClientProxy);
    onModuleInit(): Promise<void>;
    getStudentDashboard(studentId: string): Promise<{
        registeredCourses: any;
        availableCourses: any;
    }>;
}

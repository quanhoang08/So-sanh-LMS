import { DataSource, Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';
export declare class EnrollmentRepository extends Repository<Enrollment> {
    private dataSource;
    constructor(dataSource: DataSource);
    removeEnrollment(studentId: string, courseId: string): Promise<void>;
    findEnrollment(studentId: string, courseId: string): Promise<Enrollment | null>;
    createEnrollment(enrollment: Enrollment): Promise<Enrollment>;
}

import { AssignedLecturer } from "../assign-lecturer/assign-lecturer.entity";
import { AssignedLecturerRepository } from "../assign-lecturer/assign-lecturer.repository";
import { Enrollment } from "../enrollment/enrollment.entity";
import { EnrollmentRepository } from "../enrollment/enrollment.repository";
import { StudentRepository } from "../student/student.repository";
import { AssignLecturerDto } from "../assign-lecturer/assign.dto";
import { EnrollStudentDto } from "../enrollment/enrollment.dto";
export declare class AcademicAssignmentService {
    private readonly enrollmentRepo;
    private readonly assignedRepo;
    private readonly studentRepo;
    constructor(enrollmentRepo: EnrollmentRepository, assignedRepo: AssignedLecturerRepository, studentRepo: StudentRepository);
    enrollStudent(dto: EnrollStudentDto): Promise<Enrollment>;
    unenrollStudent(studentId: string, courseId: string): Promise<void | null>;
    assignLecturer(dto: AssignLecturerDto): Promise<AssignedLecturer>;
}

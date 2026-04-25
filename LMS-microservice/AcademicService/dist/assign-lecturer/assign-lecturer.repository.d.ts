import { AssignedLecturer } from './assign-lecturer.entity';
import { Repository } from 'typeorm';
export declare class AssignedLecturerRepository {
    private readonly repo;
    constructor(repo: Repository<AssignedLecturer>);
    countCoursesByLecturer(lecturerId: string): Promise<number | null>;
    save(assignment: AssignedLecturer): Promise<AssignedLecturer | null>;
}

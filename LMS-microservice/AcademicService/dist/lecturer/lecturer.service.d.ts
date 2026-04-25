import { AssignedLecturerRepository } from "../assign-lecturer/assign-lecturer.repository";
import { Lecturer } from "./lecturer.entity";
import { LecturerRepository } from "./lecturer.repository";
import { UpdateExpertiseDto } from "./lecturer.do";
export declare class LecturerService {
    private readonly lecturerRepo;
    private readonly assignedRepo;
    private readonly logger;
    constructor(lecturerRepo: LecturerRepository, assignedRepo: AssignedLecturerRepository);
    getProfile(id: string): Promise<Lecturer>;
    updateExpertise(id: string, dto: UpdateExpertiseDto): Promise<Lecturer>;
    getTeachingStats(id: string): Promise<any>;
    findAll(): Promise<Lecturer[]>;
    handleRoleAssigned(data: {
        id: number;
        email: string;
    }): Promise<void>;
    deactivatelecturer(userId: number): Promise<void>;
    findByUserId(userId: number): Promise<Lecturer | null>;
    createInitialProfile(userId: number, email: string, fullname?: string): Promise<void | Lecturer>;
    hardDelete(userId: number): Promise<{
        message: string;
    }>;
    findByLectureIds(ids: string[]): Promise<Lecturer[]>;
}

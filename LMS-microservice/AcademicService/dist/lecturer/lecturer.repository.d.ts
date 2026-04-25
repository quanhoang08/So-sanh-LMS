import { Lecturer } from "./lecturer.entity";
import { DataSource, Repository } from "typeorm";
export declare class LecturerRepository extends Repository<Lecturer> {
    private dataSource;
    constructor(dataSource: DataSource);
    findByUserId(userId: number): Promise<Lecturer | null>;
    findByLecturerId(lecturerId: string): Promise<Lecturer | null>;
    findAll(): Promise<Lecturer[] | null>;
    save(lecturer: Lecturer): Promise<Lecturer | null>;
    updateStatus(id: string, status: string): Promise<void>;
    createLecturer(data: {
        lecturerId: string;
        email: string;
        fullname?: string;
        lecturerCode?: string;
        status?: string;
    }): Promise<void>;
    delete(userId: number): any;
    findByIds(ids: string[]): Promise<Lecturer[]>;
}

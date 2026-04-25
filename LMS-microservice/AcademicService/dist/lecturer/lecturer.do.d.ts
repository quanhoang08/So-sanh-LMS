import { Lecturer } from './lecturer.entity';
export declare enum AcademicDegree {
    BACHELOR = "Bachelor",
    MASTER = "Master",
    DOCTOR = "Doctor",
    PROFESSOR = "Professor"
}
export declare class UpdateExpertiseDto {
    degree: AcademicDegree;
    specialization: string;
    bio?: string;
    department?: string;
}
export declare class LecturerResponseDto {
    id: string;
    fullname: string;
    email: string;
    lecturerCode: string;
    degree?: string;
    specialization?: string;
    department: string;
    bio?: string;
    static fromEntity(entity: Lecturer): LecturerResponseDto;
}

import { LecturerResponseDto, UpdateExpertiseDto } from "./lecturer.do";
import { LecturerService } from "./lecturer.service";
export declare class LecturerController {
    private readonly lecturerService;
    constructor(lecturerService: LecturerService);
    updateExpertise(id: string, dto: UpdateExpertiseDto): Promise<LecturerResponseDto>;
    getStats(id: string): Promise<any>;
    getAllLecturers(): Promise<LecturerResponseDto[]>;
}

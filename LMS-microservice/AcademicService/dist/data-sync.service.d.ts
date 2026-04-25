import { ClientProxy } from '@nestjs/microservices';
import { StudentService } from './student/student.service';
import { LecturerService } from './lecturer/lecturer.service';
export declare class DataSyncService {
    private readonly rabbitClient;
    private readonly studentService;
    private readonly lecturerService;
    private readonly logger;
    constructor(rabbitClient: ClientProxy, studentService: StudentService, lecturerService: LecturerService);
    handleDataReconciliation(): Promise<void>;
    private reconcileUser;
}

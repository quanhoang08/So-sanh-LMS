import { Lecturer } from '../lecturer/lecturer.entity';
export declare class DepartmentHead {
    id: string;
    lecturer: Lecturer;
    managedDepartment: string;
    appointedDate: Date;
}

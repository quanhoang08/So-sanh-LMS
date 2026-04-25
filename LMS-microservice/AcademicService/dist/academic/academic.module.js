"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicAssignmentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const academic_assign_service_1 = require("./academic-assign.service");
const academic_assign_controller_1 = require("./academic-assign.controller");
const student_module_1 = require("../student/student.module");
const enrollment_entity_1 = require("../enrollment/enrollment.entity");
const assign_lecturer_entity_1 = require("../assign-lecturer/assign-lecturer.entity");
const enrollment_repository_1 = require("../enrollment/enrollment.repository");
const assign_lecturer_repository_1 = require("../assign-lecturer/assign-lecturer.repository");
const enrollment_module_1 = require("../enrollment/enrollment.module");
const assign_lecturer_module_1 = require("../assign-lecturer/assign-lecturer.module");
const lecturer_module_1 = require("../lecturer/lecturer.module");
let AcademicAssignmentModule = class AcademicAssignmentModule {
};
exports.AcademicAssignmentModule = AcademicAssignmentModule;
exports.AcademicAssignmentModule = AcademicAssignmentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([enrollment_entity_1.Enrollment, assign_lecturer_entity_1.AssignedLecturer]),
            student_module_1.StudentModule,
            enrollment_module_1.EnrollmentModule,
            assign_lecturer_module_1.AssignedLecturerModule,
            lecturer_module_1.LecturerModule,
        ],
        controllers: [academic_assign_controller_1.AcademicAssignmentController],
        providers: [
            academic_assign_service_1.AcademicAssignmentService,
            enrollment_repository_1.EnrollmentRepository,
            assign_lecturer_repository_1.AssignedLecturerRepository,
        ],
        exports: [academic_assign_service_1.AcademicAssignmentService],
    })
], AcademicAssignmentModule);
//# sourceMappingURL=academic.module.js.map
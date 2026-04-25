"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicAssignmentController = void 0;
const common_1 = require("@nestjs/common");
const academic_assign_service_1 = require("./academic-assign.service");
const assign_dto_1 = require("../assign-lecturer/assign.dto");
const enrollment_dto_1 = require("../enrollment/enrollment.dto");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const user_role_enum_1 = require("./user-role.enum");
const academic_dto_1 = require("./academic.dto");
let AcademicAssignmentController = class AcademicAssignmentController {
    assignmentService;
    constructor(assignmentService) {
        this.assignmentService = assignmentService;
    }
    async enrollStudent(dto) {
        const enrollment = await this.assignmentService.enrollStudent(dto);
        return enrollment_dto_1.EnrollmentResponseDto.fromEntity(enrollment);
    }
    async unenroll(studentId, courseId) {
        await this.assignmentService.unenrollStudent(studentId, courseId);
    }
    async assignLecturer(dto) {
        const assignment = await this.assignmentService.assignLecturer(dto);
        return academic_dto_1.AssignedLecturerResponseDto.fromEntity(assignment);
    }
};
exports.AcademicAssignmentController = AcademicAssignmentController;
__decorate([
    (0, common_1.Post)('enroll'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.LECTURER, user_role_enum_1.UserRole.DEPT_HEAD),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [enrollment_dto_1.EnrollStudentDto]),
    __metadata("design:returntype", Promise)
], AcademicAssignmentController.prototype, "enrollStudent", null);
__decorate([
    (0, common_1.Delete)('unenroll/:studentId/:courseId'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.LECTURER, user_role_enum_1.UserRole.DEPT_HEAD),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('courseId', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AcademicAssignmentController.prototype, "unenroll", null);
__decorate([
    (0, common_1.Post)('assign-lecturer'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.DEPT_HEAD),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [assign_dto_1.AssignLecturerDto]),
    __metadata("design:returntype", Promise)
], AcademicAssignmentController.prototype, "assignLecturer", null);
exports.AcademicAssignmentController = AcademicAssignmentController = __decorate([
    (0, common_1.Controller)('academic'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [academic_assign_service_1.AcademicAssignmentService])
], AcademicAssignmentController);
//# sourceMappingURL=academic-assign.controller.js.map
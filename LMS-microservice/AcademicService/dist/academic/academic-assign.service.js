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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademicAssignmentService = void 0;
const common_1 = require("@nestjs/common");
const assign_lecturer_entity_1 = require("../assign-lecturer/assign-lecturer.entity");
const assign_lecturer_repository_1 = require("../assign-lecturer/assign-lecturer.repository");
const enrollment_entity_1 = require("../enrollment/enrollment.entity");
const enrollment_repository_1 = require("../enrollment/enrollment.repository");
const student_repository_1 = require("../student/student.repository");
let AcademicAssignmentService = class AcademicAssignmentService {
    enrollmentRepo;
    assignedRepo;
    studentRepo;
    constructor(enrollmentRepo, assignedRepo, studentRepo) {
        this.enrollmentRepo = enrollmentRepo;
        this.assignedRepo = assignedRepo;
        this.studentRepo = studentRepo;
    }
    async enrollStudent(dto) {
        const student = await this.studentRepo.findByStudentId(dto.studentId);
        if (!student)
            throw new common_1.NotFoundException('Học viên không tồn tại.');
        const existing = await this.enrollmentRepo.findOne({
            where: {
                studentId: dto.studentId,
                courseId: dto.courseId
            }
        });
        if (existing)
            throw new common_1.ConflictException('Học viên đã có trong khóa học này.');
        const newEnrollment = new enrollment_entity_1.Enrollment();
        newEnrollment.studentId = dto.studentId;
        newEnrollment.courseId = dto.courseId;
        const saved = await this.enrollmentRepo.saveOneLecturer(newEnrollment);
        if (!saved)
            throw new common_1.BadRequestException('Ghi danh thất bại.');
        return saved;
    }
    async unenrollStudent(studentId, courseId) {
        const enrollment = await this.enrollmentRepo.findOne({
            where: {
                studentId: studentId,
                courseId: courseId
            }
        });
        if (!enrollment)
            throw new common_1.NotFoundException('Học viên không có trong lớp này.');
        await this.enrollmentRepo.remove(enrollment);
        return null;
    }
    async assignLecturer(dto) {
        const assignment = new assign_lecturer_entity_1.AssignedLecturer();
        assignment.assignmentRole = dto.role;
        const saved = await this.assignedRepo.save(assignment);
        if (!saved)
            throw new common_1.InternalServerErrorException('Phân công thất bại.');
        return saved;
    }
};
exports.AcademicAssignmentService = AcademicAssignmentService;
exports.AcademicAssignmentService = AcademicAssignmentService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [enrollment_repository_1.EnrollmentRepository,
        assign_lecturer_repository_1.AssignedLecturerRepository,
        student_repository_1.StudentRepository])
], AcademicAssignmentService);
//# sourceMappingURL=academic-assign.service.js.map
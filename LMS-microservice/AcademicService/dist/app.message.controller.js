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
var AppMessageController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppMessageController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const student_service_1 = require("./student/student.service");
const lecturer_service_1 = require("./lecturer/lecturer.service");
let AppMessageController = AppMessageController_1 = class AppMessageController {
    studentService;
    lecturerService;
    logger = new common_1.Logger(AppMessageController_1.name);
    constructor(studentService, lecturerService) {
        this.studentService = studentService;
        this.lecturerService = lecturerService;
    }
    async handleUserCreated(data) {
        try {
            const existing = await this.studentService.findByEmail(data.email);
            if (existing) {
                console.log(`⚠️ Student với email ${data.email} đã tồn tại, bỏ qua.`);
                return;
            }
            await this.studentService.createFromAccount(data);
            console.log(`✅ Đã tạo Student cho user ID: ${data.id}`);
        }
        catch (e) {
            console.error('Lỗi đồng bộ:', e.message);
        }
    }
    async handleUserRoleChanged(data) {
        this.logger.log(`📥 [Role Changed] Nhận yêu cầu phân quyền cho User ID: ${data.id} -> ${data.newRole}`);
        try {
            if (data.newRole === 'STUDENT') {
                await this.studentService.handleRoleAssigned(data);
            }
            else if (data.newRole === 'LECTURER') {
                await this.lecturerService.handleRoleAssigned(data);
            }
            if (data.oldRole === 'STUDENT' && data.newRole !== 'STUDENT') {
                await this.studentService.deactivateStudent(data.id);
            }
            if (data.oldRole === 'LECTURER' && data.newRole !== 'LECTURER') {
                await this.lecturerService.deactivatelecturer(data.id);
            }
        }
        catch (error) {
            this.logger.error(`❌ Lỗi xử lý đổi Role tại Academic: ${error.message}`);
        }
    }
    async syncLecturerData(userId, email) {
        const lecturer = this.lecturerService.findByUserId(userId);
        if (!lecturer) {
            this.logger.warn(`⚠️ Phát hiện User ${userId} bị thiếu trong bảng Lecturers. Đang tự động sửa lỗi...`);
            const wrongStudent = await this.studentService.findByUserId(userId);
            if (wrongStudent) {
                await this.studentService.hardDelete(userId);
                this.logger.log(`🗑️ Đã xóa hồ sơ lỗi của User ${userId} trong bảng Students.`);
            }
            await this.lecturerService.createInitialProfile(userId, email);
            this.logger.log(`✅ Đã tạo mới hồ sơ Giảng viên cho User ${userId}.`);
        }
    }
    async syncStudentData(userId, email) {
        const student = await this.studentService.findByUserId(userId);
        if (!student) {
            this.logger.warn(`⚠️ Phát hiện User ${userId} bị thiếu trong bảng Students. Đang tự động sửa lỗi...`);
            const wrongLecturer = await this.lecturerService.findByUserId(userId);
            if (wrongLecturer) {
                await this.lecturerService.hardDelete(userId);
                this.logger.log(`🗑️ Đã xóa hồ sơ lỗi của User ${userId} trong bảng Lecturers.`);
            }
            await this.studentService.createInitialProfile(userId, email);
            this.logger.log(`✅ Đã tạo mới hồ sơ Học viên cho User ${userId}.`);
        }
    }
    async getLecturers(ids) {
        console.log("📥 GET LECTURERS IDS:", ids);
        return await this.lecturerService.findByLectureIds(ids);
    }
};
exports.AppMessageController = AppMessageController;
__decorate([
    (0, microservices_1.EventPattern)('user_created_for_academic'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppMessageController.prototype, "handleUserCreated", null);
__decorate([
    (0, microservices_1.EventPattern)('user_role_changed'),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AppMessageController.prototype, "handleUserRoleChanged", null);
__decorate([
    (0, microservices_1.EventPattern)('user_logged_in'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], AppMessageController.prototype, "syncLecturerData", null);
__decorate([
    (0, microservices_1.MessagePattern)({ cmd: 'get_lecturers_by_ids' }),
    __param(0, (0, microservices_1.Payload)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Array]),
    __metadata("design:returntype", Promise)
], AppMessageController.prototype, "getLecturers", null);
exports.AppMessageController = AppMessageController = AppMessageController_1 = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [student_service_1.StudentService,
        lecturer_service_1.LecturerService])
], AppMessageController);
//# sourceMappingURL=app.message.controller.js.map
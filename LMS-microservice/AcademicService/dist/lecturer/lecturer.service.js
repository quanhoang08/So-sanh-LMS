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
var LecturerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LecturerService = void 0;
const common_1 = require("@nestjs/common");
const assign_lecturer_repository_1 = require("../assign-lecturer/assign-lecturer.repository");
const lecturer_repository_1 = require("./lecturer.repository");
const uuid_1 = require("uuid");
let LecturerService = LecturerService_1 = class LecturerService {
    lecturerRepo;
    assignedRepo;
    logger = new common_1.Logger(LecturerService_1.name);
    constructor(lecturerRepo, assignedRepo) {
        this.lecturerRepo = lecturerRepo;
        this.assignedRepo = assignedRepo;
    }
    async getProfile(id) {
        const lecturer = await this.lecturerRepo.findByLecturerId(id);
        if (!lecturer)
            throw new common_1.NotFoundException('Giảng viên không tồn tại.');
        return lecturer;
    }
    async updateExpertise(id, dto) {
        const lecturer = await this.getProfile(id);
        lecturer.degree = dto.degree;
        lecturer.specialization = dto.specialization;
        const updated = await this.lecturerRepo.save(lecturer);
        if (!updated)
            throw new common_1.InternalServerErrorException('Không thể cập nhật chuyên môn.');
        return updated;
    }
    async getTeachingStats(id) {
        await this.getProfile(id);
        const courseCount = await this.assignedRepo.countCoursesByLecturer(id);
        return {
            lecturerId: id,
            totalAssignedCourses: courseCount || 0,
        };
    }
    async findAll() {
        const lecturers = await this.lecturerRepo.findAll();
        if (!lecturers || lecturers.length === 0) {
            throw new common_1.NotFoundException('Danh sách giảng viên trống.');
        }
        return lecturers;
    }
    async handleRoleAssigned(data) {
        const existinglecturer = await this.lecturerRepo.findByUserId(data.id);
        if (existinglecturer) {
            await this.lecturerRepo.updateStatus(existinglecturer.id, 'ACTIVE');
            this.logger.log(`✅ [lecturer] Kích hoạt lại hồ sơ Học viên ID: ${data.id}`);
        }
        else {
            const lecturerCode = `LECT-${(0, uuid_1.v4)().padStart(4, '0')}`;
            const defaultName = data.email.split('@')[0];
            await this.lecturerRepo.createLecturer({
                lecturerId: (0, uuid_1.v4)(),
                email: data.email,
                fullname: defaultName,
                lecturerCode: lecturerCode
            });
            this.logger.log(`✅ [lecturer] Tạo mới hồ sơ Giảng viên ID: ${data.id}`);
        }
    }
    async deactivatelecturer(userId) {
        const existing = await this.lecturerRepo.findByUserId(userId);
        if (existing) {
            await this.lecturerRepo.updateStatus(existing.id, 'INACTIVE');
            this.logger.log(`🚫 [lecturer] Vô hiệu hóa hồ sơ Học viên ID: ${existing.id}`);
        }
    }
    async findByUserId(userId) {
        return await this.lecturerRepo.findByUserId(userId);
    }
    async createInitialProfile(userId, email, fullname) {
        const existingLecturer = await this.findByUserId(userId);
        if (existingLecturer) {
            console.log(`⚠️ Giảng viên ID ${existingLecturer.id} đã tồn tại, bỏ qua tạo mới.`);
            return existingLecturer;
        }
        const lecturerId = (0, uuid_1.v4)();
        return this.lecturerRepo.createLecturer({
            lecturerId: lecturerId,
            email: email,
            fullname: fullname || "",
            lecturerCode: `LECT-${lecturerId.padStart(4, '0')}`
        });
    }
    async hardDelete(userId) {
        const result = await this.lecturerRepo.delete(userId);
        if (result.affected && result.affected > 0) {
            return { message: `Deleted student with id ${userId}` };
        }
        else {
            throw new common_1.NotFoundException(`Student with id ${userId} not found`);
        }
    }
    async findByLectureIds(ids) {
        if (!ids || ids.length === 0)
            return [];
        return await this.lecturerRepo.findByIds(ids);
    }
};
exports.LecturerService = LecturerService;
exports.LecturerService = LecturerService = LecturerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [lecturer_repository_1.LecturerRepository,
        assign_lecturer_repository_1.AssignedLecturerRepository])
], LecturerService);
//# sourceMappingURL=lecturer.service.js.map
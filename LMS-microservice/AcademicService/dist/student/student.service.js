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
var StudentService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const student_repository_1 = require("./student.repository");
const student_enum_1 = require("./student.enum");
const microservices_1 = require("@nestjs/microservices");
const uuid_1 = require("uuid");
let StudentService = StudentService_1 = class StudentService {
    studentRepo;
    rabbitClient;
    logger = new common_1.Logger(StudentService_1.name);
    constructor(studentRepo, rabbitClient) {
        this.studentRepo = studentRepo;
        this.rabbitClient = rabbitClient;
    }
    async createFromAccount(data) {
        const existingStudent = await this.studentRepo.findByUserId(data.id);
        if (existingStudent) {
            console.log(`⚠️ Sinh viên ID ${existingStudent.id} đã tồn tại, bỏ qua tạo mới.`);
            return existingStudent;
        }
        const studentId = (0, uuid_1.v4)();
        const generatedCode = `STU-${studentId.padStart(4, '0')}`;
        const newStudent = await this.studentRepo.create({
            id: studentId,
            email: data.email,
            fullname: data.fullname || 'Học viên mới',
            status: student_enum_1.StudentStatus.UNENROLLED,
            studentCode: generatedCode
        });
        try {
            console.log(`✅ Đã lưu sinh viên mới vào DB Academic: ID ${newStudent.id}`);
            return newStudent;
        }
        catch (error) {
            console.error('❌ Lỗi lưu sinh viên từ Account:', error.message);
            throw error;
        }
    }
    async getProfileByEmail(email) {
        const student = await this.studentRepo.findByEmail(email);
        if (!student)
            throw new common_1.NotFoundException('Không tìm thấy thông tin học viên.');
        return student;
    }
    async updateProfile(id, updateDto) {
        const student = await this.studentRepo.findByUserId(id);
        if (!student)
            throw new common_1.NotFoundException('Không tìm thấy thông tin học viên.');
        let isProfileChanged = false;
        if (updateDto.fullname && updateDto.fullname !== student.fullname) {
            student.fullname = updateDto.fullname;
            isProfileChanged = true;
        }
        if (updateDto.phone)
            student.phone = updateDto.phone;
        if (updateDto.avatarUrl)
            student.avatarUrl = updateDto.avatarUrl;
        const updated = await this.studentRepo.save(student);
        if (!updated)
            throw new common_1.InternalServerErrorException('Cập nhật thất bại.');
        if (isProfileChanged) {
            this.rabbitClient.emit('profile_updated', {
                id: updated.id,
                fullname: updated.fullname,
            });
            this.logger.log(`🚀 Đã gửi event profile_updated cho User ID: ${updated.id}`);
        }
        return updated;
    }
    async patchUserId(studentId, userId) {
        const student = await this.studentRepo.findByStudentId(studentId);
        if (!student) {
            throw new common_1.NotFoundException('Student không tồn tại');
        }
        student.userId = userId;
        await this.studentRepo.save(student);
    }
    async getStudents(courseId) {
        let students;
        if (courseId) {
            students = await this.studentRepo.findByCourseId(courseId);
        }
        else {
            students = await this.studentRepo.findAll();
        }
        if (!students || students.length === 0) {
            throw new common_1.NotFoundException('Danh sách học viên trống.');
        }
        return students;
    }
    async findByEmail(email) {
        const student = await this.studentRepo.findByEmail(email);
        if (!student)
            throw new common_1.NotFoundException('Không tìm thấy thông tin học viên.');
        return student;
    }
    async handleRoleAssigned(data) {
        const existingStudent = await this.studentRepo.findByUserId(data.id);
        if (existingStudent) {
            const studentId = existingStudent.id;
            await this.studentRepo.updateStatus(studentId, 'ACTIVE');
            this.logger.log(`✅ [Student] Kích hoạt lại hồ sơ Học viên ID: ${studentId}`);
        }
        else {
            const studentId = (0, uuid_1.v4)();
            const generatedCode = `STU-${studentId.toString().padStart(4, '0')}`;
            const defaultName = data.email.split('@')[0];
            await this.studentRepo.create({
                id: studentId,
                email: data.email,
                fullname: defaultName,
                studentCode: generatedCode,
                status: student_enum_1.StudentStatus.UNENROLLED,
            });
            this.logger.log(`✅ [Student] Tạo mới hồ sơ Học viên ID: ${studentId}`);
        }
    }
    async deactivateStudent(studentId) {
        const existing = await this.studentRepo.findByUserId(studentId);
        if (existing) {
            await this.studentRepo.updateStatus(existing.id, 'INACTIVE');
            this.logger.log(`🚫 [Student] Vô hiệu hóa hồ sơ Học viên ID: ${studentId}`);
        }
    }
    async findByUserId(userId) {
        return await this.studentRepo.findByUserId(userId);
    }
    async findByStudentId(studentId) {
        return await this.studentRepo.findByStudentId(studentId);
    }
    async hardDelete(userId) {
        const result = await this.studentRepo.delete(userId);
        if (result.affected && result.affected > 0) {
            return { message: `Deleted student with id ${userId}` };
        }
        else {
            throw new common_1.NotFoundException(`Student with id ${userId} not found`);
        }
    }
    async createInitialProfile(userId, email) {
        const existingStudent = await this.findByUserId(userId);
        if (existingStudent) {
            console.log(`⚠️ Giảng viên ID ${existingStudent.id} đã tồn tại, bỏ qua tạo mới.`);
            return existingStudent;
        }
        const studentId = (0, uuid_1.v4)();
        return this.studentRepo.create({
            id: studentId,
            email: email,
            fullname: ""
        });
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = StudentService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('RABBITMQ_SERVICE')),
    __metadata("design:paramtypes", [student_repository_1.StudentRepository,
        microservices_1.ClientProxy])
], StudentService);
//# sourceMappingURL=student.service.js.map
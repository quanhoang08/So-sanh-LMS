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
exports.StudentRepository = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const typeorm_2 = require("@nestjs/typeorm");
const student_entity_1 = require("./student.entity");
const student_enum_1 = require("./student.enum");
let StudentRepository = class StudentRepository {
    repo;
    findOne(id) {
        return this.repo.findOne({
            where: { id },
            relations: ['enrollments'],
        });
    }
    constructor(repo) {
        this.repo = repo;
    }
    async findStudentWithEnrollments(id) {
        return this.repo.findOne({
            where: { id },
            relations: ['enrollments'],
        });
    }
    async create(data) {
        const newStudent = this.repo.create({
            id: data.id,
            email: data.email,
            fullname: data.fullname,
            phone: data.phone,
            status: data.status || student_enum_1.StudentStatus.ENROLLED,
            studentCode: data.studentCode,
        });
        return await this.repo.saveOneLecturer(newStudent);
    }
    async updateStatus(id, status) {
        await this.repo.update(id, { status: status });
    }
    async findByUserId(id) {
        return this.repo.findOne({
            where: { userId: id }
        });
    }
    async findByStudentId(id) {
        return this.repo.findOne({ where: { id } });
    }
    async findAll() {
        return this.repo.find();
    }
    async findByCourseId(courseId) {
        return this.repo.find({
            where: {
                enrollments: { id: courseId }
            },
            relations: ['enrollments'],
        });
    }
    async save(student) {
        return this.repo.saveOneLecturer(student);
    }
    async delete(userId) {
        return this.repo.delete(userId);
    }
    async findByEmail(email) {
        return this.repo.findOne({ where: { email } });
    }
};
exports.StudentRepository = StudentRepository;
exports.StudentRepository = StudentRepository = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(student_entity_1.Student)),
    __metadata("design:paramtypes", [typeorm_1.Repository])
], StudentRepository);
//# sourceMappingURL=student.repository.js.map
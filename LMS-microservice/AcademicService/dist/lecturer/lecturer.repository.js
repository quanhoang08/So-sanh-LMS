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
exports.LecturerRepository = void 0;
const lecturer_entity_1 = require("./lecturer.entity");
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
let LecturerRepository = class LecturerRepository extends typeorm_1.Repository {
    dataSource;
    constructor(dataSource) {
        super(lecturer_entity_1.Lecturer, dataSource.createEntityManager());
        this.dataSource = dataSource;
    }
    async findByUserId(userId) {
        return this.findOne({ where: { userId: userId } });
    }
    async findByLecturerId(lecturerId) {
        return this.findOne({ where: { id: lecturerId } });
    }
    async findAll() {
        return this.find();
    }
    async save(lecturer) {
        return this.save(lecturer);
    }
    async updateStatus(id, status) {
        await this.update(id, { status: status });
    }
    async createLecturer(data) {
        this.create({
            id: data.lecturerId,
            email: data.email,
            fullname: data.fullname,
            status: data.status ?? 'ACTIVE',
            lecturerCode: data.lecturerCode,
        });
    }
    async delete(userId) {
        return this.delete(userId);
    }
    async findByIds(ids) {
        return this.find({
            where: {
                id: (0, typeorm_1.In)(ids),
            },
        });
    }
};
exports.LecturerRepository = LecturerRepository;
exports.LecturerRepository = LecturerRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], LecturerRepository);
//# sourceMappingURL=lecturer.repository.js.map
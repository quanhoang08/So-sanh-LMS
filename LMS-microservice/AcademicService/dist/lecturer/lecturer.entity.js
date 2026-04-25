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
exports.Lecturer = void 0;
const typeorm_1 = require("typeorm");
const assign_lecturer_entity_1 = require("../assign-lecturer/assign-lecturer.entity");
let Lecturer = class Lecturer {
    id;
    userId;
    fullname;
    email;
    lecturerCode;
    degree;
    department;
    createdAt;
    updatedAt;
    assignments;
    specialization;
    bio;
    status;
};
exports.Lecturer = Lecturer;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'varchar' }),
    __metadata("design:type", String)
], Lecturer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ name: "user_id", type: 'integer', nullable: false }),
    __metadata("design:type", Number)
], Lecturer.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 150 }),
    __metadata("design:type", String)
], Lecturer.prototype, "fullname", void 0);
__decorate([
    (0, typeorm_1.Index)(),
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], Lecturer.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 50 }),
    __metadata("design:type", String)
], Lecturer.prototype, "lecturerCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Lecturer.prototype, "degree", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Lecturer.prototype, "department", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Lecturer.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], Lecturer.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => assign_lecturer_entity_1.AssignedLecturer, (assignment) => assignment.lecturer),
    __metadata("design:type", Array)
], Lecturer.prototype, "assignments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lecturer.prototype, "specialization", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Lecturer.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'ACTIVE' }),
    __metadata("design:type", String)
], Lecturer.prototype, "status", void 0);
exports.Lecturer = Lecturer = __decorate([
    (0, typeorm_1.Entity)('lecturers')
], Lecturer);
//# sourceMappingURL=lecturer.entity.js.map
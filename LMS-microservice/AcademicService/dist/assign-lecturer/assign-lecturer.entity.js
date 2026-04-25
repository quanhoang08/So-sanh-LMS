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
exports.AssignedLecturer = void 0;
const typeorm_1 = require("typeorm");
const lecturer_entity_1 = require("../lecturer/lecturer.entity");
let AssignedLecturer = class AssignedLecturer {
    id;
    lecturerId;
    lecturer;
    targetId;
    assignmentRole;
    semester;
    assignedAt;
    courseId;
};
exports.AssignedLecturer = AssignedLecturer;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('increment'),
    __metadata("design:type", Number)
], AssignedLecturer.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'lecturer_id' }),
    __metadata("design:type", String)
], AssignedLecturer.prototype, "lecturerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => lecturer_entity_1.Lecturer, (lecturer) => lecturer.assignments, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'lecturer_id' }),
    __metadata("design:type", lecturer_entity_1.Lecturer)
], AssignedLecturer.prototype, "lecturer", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'target_id', type: 'uuid' }),
    __metadata("design:type", String)
], AssignedLecturer.prototype, "targetId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50 }),
    __metadata("design:type", String)
], AssignedLecturer.prototype, "assignmentRole", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], AssignedLecturer.prototype, "semester", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], AssignedLecturer.prototype, "assignedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'course_id', type: 'varchar' }),
    __metadata("design:type", String)
], AssignedLecturer.prototype, "courseId", void 0);
exports.AssignedLecturer = AssignedLecturer = __decorate([
    (0, typeorm_1.Entity)('assigned_lecturers')
], AssignedLecturer);
//# sourceMappingURL=assign-lecturer.entity.js.map
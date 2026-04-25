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
exports.DepartmentHead = void 0;
const typeorm_1 = require("typeorm");
const lecturer_entity_1 = require("../lecturer/lecturer.entity");
let DepartmentHead = class DepartmentHead {
    id;
    lecturer;
    managedDepartment;
    appointedDate;
};
exports.DepartmentHead = DepartmentHead;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ type: 'uuid' }),
    __metadata("design:type", String)
], DepartmentHead.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => lecturer_entity_1.Lecturer, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'id' }),
    __metadata("design:type", lecturer_entity_1.Lecturer)
], DepartmentHead.prototype, "lecturer", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], DepartmentHead.prototype, "managedDepartment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], DepartmentHead.prototype, "appointedDate", void 0);
exports.DepartmentHead = DepartmentHead = __decorate([
    (0, typeorm_1.Entity)('department_heads')
], DepartmentHead);
//# sourceMappingURL=department-heade.entity.js.map
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
exports.AssignLecturerDto = exports.AssignmentRole = void 0;
const class_validator_1 = require("class-validator");
var AssignmentRole;
(function (AssignmentRole) {
    AssignmentRole["PRIMARY"] = "PRIMARY_TEACHER";
    AssignmentRole["ASSISTANT"] = "ASSISTANT_TEACHER";
    AssignmentRole["REVIEWER"] = "REVIEWER";
})(AssignmentRole || (exports.AssignmentRole = AssignmentRole = {}));
class AssignLecturerDto {
    lecturerId;
    courseId;
    role;
}
exports.AssignLecturerDto = AssignLecturerDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AssignLecturerDto.prototype, "lecturerId", void 0);
__decorate([
    (0, class_validator_1.IsUUID)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], AssignLecturerDto.prototype, "courseId", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(AssignmentRole),
    __metadata("design:type", String)
], AssignLecturerDto.prototype, "role", void 0);
//# sourceMappingURL=assign.dto.js.map
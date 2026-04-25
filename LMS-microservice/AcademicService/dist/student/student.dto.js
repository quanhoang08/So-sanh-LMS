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
exports.StudentResponseDto = exports.UpdateStudentDto = void 0;
const class_validator_1 = require("class-validator");
class UpdateStudentDto {
    fullname;
    phone;
    avatarUrl;
}
exports.UpdateStudentDto = UpdateStudentDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "fullname", void 0);
__decorate([
    (0, class_validator_1.IsPhoneNumber)('VN'),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "phone", void 0);
__decorate([
    (0, class_validator_1.IsUrl)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateStudentDto.prototype, "avatarUrl", void 0);
class StudentResponseDto {
    id;
    fullname;
    email;
    phone;
    avatarUrl;
    studentCode;
    status;
    static fromEntity(entity) {
        const dto = new StudentResponseDto();
        dto.id = entity.id;
        dto.fullname = entity.fullname;
        dto.email = entity.email;
        dto.phone = entity.phone;
        dto.avatarUrl = entity.avatarUrl;
        dto.studentCode = entity.studentCode;
        dto.status = entity.status;
        return dto;
    }
}
exports.StudentResponseDto = StudentResponseDto;
//# sourceMappingURL=student.dto.js.map
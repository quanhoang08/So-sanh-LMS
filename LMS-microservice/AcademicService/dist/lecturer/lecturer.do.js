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
exports.LecturerResponseDto = exports.UpdateExpertiseDto = exports.AcademicDegree = void 0;
const class_validator_1 = require("class-validator");
var AcademicDegree;
(function (AcademicDegree) {
    AcademicDegree["BACHELOR"] = "Bachelor";
    AcademicDegree["MASTER"] = "Master";
    AcademicDegree["DOCTOR"] = "Doctor";
    AcademicDegree["PROFESSOR"] = "Professor";
})(AcademicDegree || (exports.AcademicDegree = AcademicDegree = {}));
class UpdateExpertiseDto {
    degree;
    specialization;
    bio;
    department;
}
exports.UpdateExpertiseDto = UpdateExpertiseDto;
__decorate([
    (0, class_validator_1.IsEnum)(AcademicDegree, { message: 'Học vị không hợp lệ' }),
    (0, class_validator_1.IsNotEmpty)({ message: 'Học vị không được để trống' }),
    __metadata("design:type", String)
], UpdateExpertiseDto.prototype, "degree", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)({ message: 'Chuyên môn không được để trống' }),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], UpdateExpertiseDto.prototype, "specialization", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], UpdateExpertiseDto.prototype, "bio", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], UpdateExpertiseDto.prototype, "department", void 0);
class LecturerResponseDto {
    id;
    fullname;
    email;
    lecturerCode;
    degree;
    specialization;
    department;
    bio;
    static fromEntity(entity) {
        const dto = new LecturerResponseDto();
        dto.id = entity.id;
        dto.fullname = entity.fullname;
        dto.email = entity.email;
        dto.lecturerCode = entity.lecturerCode;
        dto.degree = entity.degree;
        dto.specialization = entity.specialization;
        dto.department = entity.department;
        dto.bio = entity.bio;
        return dto;
    }
}
exports.LecturerResponseDto = LecturerResponseDto;
//# sourceMappingURL=lecturer.do.js.map
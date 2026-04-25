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
exports.LecturerController = void 0;
const common_1 = require("@nestjs/common");
const lecturer_do_1 = require("./lecturer.do");
const lecturer_service_1 = require("./lecturer.service");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const roles_guard_1 = require("../auth/guards/roles.guard");
const roles_decorator_1 = require("../auth/decorators/roles.decorator");
const current_user_decorator_1 = require("../auth/decorators/current-user.decorator");
const user_role_enum_1 = require("../academic/user-role.enum");
let LecturerController = class LecturerController {
    lecturerService;
    constructor(lecturerService) {
        this.lecturerService = lecturerService;
    }
    async updateExpertise(id, dto) {
        const updated = await this.lecturerService.updateExpertise(id, dto);
        return lecturer_do_1.LecturerResponseDto.fromEntity(updated);
    }
    async getStats(id) {
        return await this.lecturerService.getTeachingStats(id);
    }
    async getAllLecturers() {
        const lecturers = await this.lecturerService.findAll();
        return lecturers.map(l => lecturer_do_1.LecturerResponseDto.fromEntity(l));
    }
};
exports.LecturerController = LecturerController;
__decorate([
    (0, common_1.Put)('expertise'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.LECTURER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, current_user_decorator_1.CurrentUser)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, lecturer_do_1.UpdateExpertiseDto]),
    __metadata("design:returntype", Promise)
], LecturerController.prototype, "updateExpertise", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.DEPT_HEAD, user_role_enum_1.UserRole.LECTURER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], LecturerController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_role_enum_1.UserRole.ADMIN, user_role_enum_1.UserRole.DEPT_HEAD),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], LecturerController.prototype, "getAllLecturers", null);
exports.LecturerController = LecturerController = __decorate([
    (0, common_1.Controller)('lecturers'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [lecturer_service_1.LecturerService])
], LecturerController);
//# sourceMappingURL=lecturer.controller.js.map
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
var DataSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataSyncService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const student_service_1 = require("./student/student.service");
const lecturer_service_1 = require("./lecturer/lecturer.service");
let DataSyncService = DataSyncService_1 = class DataSyncService {
    rabbitClient;
    studentService;
    lecturerService;
    logger = new common_1.Logger(DataSyncService_1.name);
    constructor(rabbitClient, studentService, lecturerService) {
        this.rabbitClient = rabbitClient;
        this.studentService = studentService;
        this.lecturerService = lecturerService;
    }
    async handleDataReconciliation() {
        this.logger.log('🧹 Bắt đầu chạy chiến dịch Đối soát và Dọn dẹp dữ liệu...');
        try {
            const users = await (0, rxjs_1.firstValueFrom)(this.rabbitClient.send('get_all_users_for_sync', {}));
            let fixedCount = 0;
            for (const user of users) {
                const isFixed = await this.reconcileUser(user);
                if (isFixed)
                    fixedCount++;
            }
            this.logger.log(`✨ Hoàn tất dọn dẹp. Đã tự động sửa lỗi cho ${fixedCount} hồ sơ.`);
        }
        catch (error) {
            this.logger.error(`❌ Lỗi trong quá trình đối soát: ${error.message}`);
        }
    }
    async reconcileUser(user) {
        const userId = Number(user.id);
        let isFixed = false;
        if (user.role === 'LECTURER') {
            const lecturer = await this.lecturerService.findByUserId(userId);
            if (!lecturer) {
                await this.studentService.hardDelete(userId);
                await this.lecturerService.createInitialProfile(userId, user.email);
                this.logger.log(`🔧 Đã sửa lỗi Role cho User ${userId} -> Chuyển thành LECTURER`);
                isFixed = true;
            }
        }
        else if (user.role === 'STUDENT') {
            const student = await this.studentService.findByUserId(userId);
            if (!student) {
                await this.lecturerService.hardDelete(userId);
                await this.studentService.createInitialProfile(userId, user.email);
                this.logger.log(`🔧 Đã sửa lỗi Role cho User ${userId} -> Chuyển thành STUDENT`);
                isFixed = true;
            }
        }
        return isFixed;
    }
};
exports.DataSyncService = DataSyncService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DataSyncService.prototype, "handleDataReconciliation", null);
exports.DataSyncService = DataSyncService = DataSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)('RABBITMQ_SERVICE')),
    __metadata("design:paramtypes", [microservices_1.ClientProxy,
        student_service_1.StudentService,
        lecturer_service_1.LecturerService])
], DataSyncService);
//# sourceMappingURL=data-sync.service.js.map
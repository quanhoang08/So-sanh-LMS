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
exports.EnrollmentService = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const rxjs_1 = require("rxjs");
const enrollment_repository_1 = require("./enrollment.repository");
let EnrollmentService = class EnrollmentService {
    enrollmentRepository;
    courseClient;
    constructor(enrollmentRepository, courseClient) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseClient = courseClient;
    }
    async onModuleInit() {
        await this.courseClient.connect();
    }
    async getStudentDashboard(studentId) {
        const enrollments = await this.enrollmentRepository.find({
            where: { studentId }
        });
        const enrollmentMap = new Map(enrollments.map(e => [e.courseId, e.enrollmentStatus]));
        const openCourses = await (0, rxjs_1.firstValueFrom)(this.courseClient.send({ cmd: 'get_available_courses' }, []));
        const instructorIds = [
            ...new Set(openCourses.map(c => c.instructorId))
        ];
        const enrichedCourses = openCourses.map(course => ({
            ...course,
            enrollmentStatus: enrollmentMap.get(course.id) || 'UNENROLLMENT'
        }));
        const registeredCourses = enrichedCourses.filter(c => c.enrollmentStatus === 'ACTIVE' || c.enrollmentStatus === 'COMPLETED');
        const availableCourses = enrichedCourses.filter(c => c.enrollmentStatus === 'UNENROLLMENT');
        return {
            registeredCourses,
            availableCourses
        };
    }
};
exports.EnrollmentService = EnrollmentService;
exports.EnrollmentService = EnrollmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)('COURSE_SERVICE')),
    __metadata("design:paramtypes", [enrollment_repository_1.EnrollmentRepository,
        microservices_1.ClientProxy])
], EnrollmentService);
//# sourceMappingURL=enrollment.service.js.map
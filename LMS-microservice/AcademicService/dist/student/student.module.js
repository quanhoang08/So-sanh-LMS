"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const student_entity_1 = require("./student.entity");
const student_controller_1 = require("./student.controller");
const app_message_controller_1 = require("../app.message.controller");
const student_service_1 = require("./student.service");
const student_repository_1 = require("./student.repository");
const lecturer_module_1 = require("../lecturer/lecturer.module");
const microservices_1 = require("@nestjs/microservices");
let StudentModule = class StudentModule {
};
exports.StudentModule = StudentModule;
exports.StudentModule = StudentModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([student_entity_1.Student]),
            lecturer_module_1.LecturerModule,
            microservices_1.ClientsModule.register([
                {
                    name: 'RABBITMQ_SERVICE',
                    transport: microservices_1.Transport.RMQ,
                    options: {
                        urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
                        queue: 'account_queue',
                        queueOptions: {
                            durable: false,
                        },
                    },
                },
            ]),
        ],
        controllers: [
            student_controller_1.StudentController,
            app_message_controller_1.AppMessageController,
        ],
        providers: [
            student_service_1.StudentService,
            student_repository_1.StudentRepository,
        ],
        exports: [student_service_1.StudentService, student_repository_1.StudentRepository],
    })
], StudentModule);
//# sourceMappingURL=student.module.js.map
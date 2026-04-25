"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const app_module_1 = require("./app.module");
const config_1 = require("@nestjs/config");
const microservices_1 = require("@nestjs/microservices");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.connectMicroservice({
        transport: microservices_1.Transport.RMQ,
        options: {
            urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
            queue: 'user_created_queue',
            queueOptions: { durable: false, autoDelete: false },
            noAck: false,
        },
    });
    await app.startAllMicroservices();
    console.log('✅ Microservices started (RabbitMQ)');
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        exceptionFactory: (errors) => {
            return new common_1.BadRequestException({
                statusCode: 400,
                message: errors.map(err => ({
                    property: err.property,
                    constraints: err.constraints,
                })),
                error: 'Bad Request',
            });
        },
    }));
    const configService = app.get(config_1.ConfigService);
    const port = configService.get('PORT') || 3000;
    await app.listen(port);
    console.log(`
╔════════════════════════════════════════╗
║   🚀 ACADEMIC SERVICE STARTED          ║
╠════════════════════════════════════════╣
║   HTTP: http://localhost:${port}        ║
║   Microservice: RabbitMQ                ║
║   CORS: ✅ Enabled                      ║
╚════════════════════════════════════════╝
  `);
}
bootstrap().catch(err => {
    console.error('❌ Bootstrap failed:', err);
    process.exit(1);
});
//# sourceMappingURL=main.js.map
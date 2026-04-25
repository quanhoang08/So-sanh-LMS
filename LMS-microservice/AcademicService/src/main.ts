// main.ts
import { NestFactory } from '@nestjs/core';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

// AcademicService\src\main.ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS
  // app.enableCors({
  //   origin: 'http://localhost:5173',
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  // });

  // Microservice setup
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
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
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: (errors) => {
        return new BadRequestException({
          statusCode: 400,
          message: errors.map(err => ({
            property: err.property,
            constraints: err.constraints,
          })),
          error: 'Bad Request',
        });
      },
    })
  );

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;
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
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS
  // app.enableCors({
  //   origin: 'http://localhost:5173',
  //   credentials: true,
  //   methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  //   allowedHeaders: ['Content-Type', 'Authorization'],
  // });

  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      // forbidNonWhitelisted: true,
      transform: true,
    })
  );

    // 🔥 Microservice
  app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
      queue: 'course_queue', // 👈 PHẢI giống AcademicService
      queueOptions: {
        durable: false,
      },
    },
  });

  await app.startAllMicroservices(); // 👈 BẮT BUỘC
  
  const port = process.env.PORT || 3002;
  await app.listen(port);
  console.log(`🚀 Course Service running on: http://localhost:${port}`);
}

bootstrap();
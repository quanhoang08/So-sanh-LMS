import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../user/user.entity";
import { UserRepository } from "../user/user.repository";
import { UserService } from "../user/user.service";
import { AdminController } from "./admin.controller";
import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { UserModule } from "../user/user.module";
import { ClientsModule, Transport } from "@nestjs/microservices";

@Module({
  imports: [TypeOrmModule.forFeature([User]), 
  AuthModule,
  UserModule,
  ClientsModule.register([
      {
        name: 'ACCOUNT_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://rabbitmq:5672'],
          queue: 'user_created_queue',
          queueOptions: { durable: false },
        },
      },
    ]),
],
  controllers: [AdminController],
  providers: [UserService, UserRepository],
  exports: [],
})
export class AdminModule {}
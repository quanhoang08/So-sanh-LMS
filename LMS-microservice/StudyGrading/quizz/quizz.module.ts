import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quizz } from './quizz.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quizz])],
  exports: [TypeOrmModule]
})
export class QuizzModule {}
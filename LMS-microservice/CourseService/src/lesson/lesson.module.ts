// src/modules/lesson/lesson.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Lesson } from './lesson.entity';
import { Course } from '../course/course.entity';
import { Material } from '../material/material.entity';

// Controllers
import { LessonController } from './lesson.controller';

// Services

import { CourseModule } from '../course/course.module';
import { LessonService } from './lesson.service';
// CourseService\src\lesson\lesson.module.ts
@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Course, Material]),
  ],
  controllers: [LessonController],
  providers: [LessonService],
  exports: [LessonService],
})
export class LessonModule {}
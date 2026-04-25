import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Submission } from './submission.entity';
// import { SubmissionService } from './submission.service';
// import { SubmissionController } from './submission.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Submission])],
  // controllers: [SubmissionController],
  // providers: [SubmissionService],
  exports: [TypeOrmModule],
})
export class SubmissionModule {}
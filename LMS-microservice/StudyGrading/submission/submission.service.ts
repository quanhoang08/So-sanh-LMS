import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Submission } from './submission.entity';
import { Quizz } from '../quizz/quizz.entity';

@Injectable()
export class SubmissionService {
  constructor(
    @InjectRepository(Submission)
    private readonly subRepo: Repository<Submission>,
    @InjectRepository(Quizz)
    private readonly quizzRepo: Repository<Quizz>, // Cần gọi Quizz để chấm điểm tự động
  ) {}

  // 1. Học viên nộp bài
  async submitQuizz(studentId: string, quizId: string, answers: any, fileUrl?: string): Promise<Submission> {
    const quiz = await this.quizzRepo.findOne({ 
      where: { id: quizId }, 
      relations: ['questions'] 
    });
    if (!quiz) throw new NotFoundException('Không tìm thấy bài kiểm tra!');

    let calculatedScore = 0;
    let status = 'submitted';

    // Tính điểm tự động nếu là dạng Quiz trắc nghiệm
    if (quiz.type === 'quiz' && answers) {
      quiz.questions.forEach((q) => {
        // Giả sử answers là object: { "questionId_1": "A", "questionId_2": "B" }
        if (answers[q.id] === q.correctAnswer) {
          calculatedScore += q.points;
        }
      });
      status = 'graded'; // Trắc nghiệm nộp xong là có điểm luôn
    }

    const newSubmission = this.subRepo.create({
      studentId,
      quizz: { id: quizId },
      answers,
      fileUrl,
      score: quiz.type === 'quiz' ? calculatedScore : undefined,
      status,
    });

    return this.subRepo.save(newSubmission);
  }

  // 2. Xem danh sách bài nộp của 1 bài kiểm tra
  async getSubmissionsForQuiz(quizId: string): Promise<Submission[]> {
    return this.subRepo.find({
      where: { quizz: { id: quizId } },
      order: { submittedAt: 'DESC' },
    });
  }

  // 3. Giảng viên chấm điểm (Dành cho tự luận / file đính kèm)
  async gradeSubmission(submissionId: string, score: number, feedback?: string): Promise<Submission> {
    const submission = await this.subRepo.findOne({ where: { id: submissionId } });
    if (!submission) throw new NotFoundException('Không tìm thấy bài nộp!');

    submission.score = score;
    submission.feedback = feedback || "";
    submission.status = 'graded';
    
    return this.subRepo.save(submission);
  }

  // 4. Học viên yêu cầu chấm lại (Regrade Request)
  async requestRegrade(submissionId: string, studentId: string, reason: string): Promise<Submission> {
    const submission = await this.subRepo.findOne({ where: { id: submissionId, studentId } });
    if (!submission) throw new NotFoundException('Không tìm thấy bài nộp của bạn!');
    if (submission.status !== 'graded') throw new BadRequestException('Bài nộp chưa được chấm điểm!');

    submission.status = 'regrade_requested';
    // Có thể nối thêm reason vào feedback hoặc tạo một cột mới regradeReason trong Entity
    submission.feedback = (submission.feedback || '') + `\n[Yêu cầu chấm lại]: ${reason}`;

    return this.subRepo.save(submission);
  }

  // 5. Giảng viên phản hồi yêu cầu chấm lại
  async respondRegrade(submissionId: string, newScore: number, responseFeedback: string): Promise<Submission> {
    const submission = await this.subRepo.findOne({ where: { id: submissionId } });
    if (!submission) throw new NotFoundException('Không tìm thấy bài nộp!');
    if (submission.status !== 'regrade_requested') throw new BadRequestException('Bài nộp không có yêu cầu chấm lại!');

    submission.score = newScore;
    submission.feedback = (submission.feedback || '') + `\n[Phản hồi GV]: ${responseFeedback}`;
    submission.status = 'graded';

    return this.subRepo.save(submission);
  }
}
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Question } from './question.entity';

@Injectable()
export class QuestionService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepo: Repository<Question>,
  ) {}

  // 1. Thêm câu hỏi vào bài kiểm tra
  async addQuestion(quizId: string, questionData: Partial<Question>): Promise<Question> {
    const newQuestion = this.questionRepo.create({
      ...questionData,
      quizz: { id: quizId },
    });
    return this.questionRepo.save(newQuestion);
  }

  // 2. Chỉnh sửa câu hỏi
  async updateQuestion(questionId: string, updateData: Partial<Question>): Promise<Question> {
    const question = await this.questionRepo.findOne({ where: { id: questionId } });
    if (!question) throw new NotFoundException('Không tìm thấy câu hỏi!');

    Object.assign(question, updateData);
    return this.questionRepo.save(question);
  }

  // 3. Xóa câu hỏi
  async deleteQuestion(questionId: string): Promise<void> {
    const result = await this.questionRepo.delete(questionId);
    if (result.affected === 0) throw new NotFoundException('Không tìm thấy câu hỏi để xóa!');
  }
}
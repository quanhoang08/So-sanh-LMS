import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quizz } from './quizz.entity';

@Injectable()
export class QuizzService {
  constructor(
    @InjectRepository(Quizz)
    private readonly quizzRepo: Repository<Quizz>,
  ) {}

  // 1. Xem danh sách bài kiểm tra trong khóa học
  async findAllByCourse(courseId: string): Promise<Quizz[]> {
    return this.quizzRepo.find({
      where: { course: { id: courseId } },
      select: ['id', 'title', 'type', 'timeLimit', 'maxScore', 'passingScore', 'createdAt'],
    });
  }

  // 2. Xem chi tiết bài kiểm tra (Kèm danh sách câu hỏi)
  async findOneWithDetails(quizId: string): Promise<Quizz> {
    const quiz = await this.quizzRepo.findOne({
      where: { id: quizId },
      relations: ['questions'], // Load kèm câu hỏi
    });
    if (!quiz) throw new NotFoundException('Không tìm thấy bài kiểm tra!');
    return quiz;
  }

  // 3. Tạo bài kiểm tra mới
  async createQuizz(courseId: string, creatorId: string, createData: Partial<Quizz>): Promise<Quizz> {
    const newQuiz = this.quizzRepo.create({
      ...createData,
      course: { id: courseId }, // Gán khóa học
      creatorId,
    });
    return this.quizzRepo.save(newQuiz);
  }

  // 4. Chỉnh sửa bài kiểm tra
  async updateQuizz(quizId: string, instructorId: string, updateData: Partial<Quizz>): Promise<Quizz> {
    const quiz = await this.findOneWithDetails(quizId);
    
    // Kiểm tra quyền (Chỉ người tạo mới được sửa - có thể bỏ nếu Trưởng bộ môn cũng được sửa)
    if (quiz.creatorId !== instructorId) {
      throw new BadRequestException('Bạn không có quyền chỉnh sửa bài kiểm tra này!');
    }

    Object.assign(quiz, updateData);
    return this.quizzRepo.save(quiz);
  }

  // 5. Xóa bài kiểm tra
  async deleteQuizz(quizId: string, instructorId: string): Promise<void> {
    const quiz = await this.quizzRepo.findOne({
      where: { id: quizId },
      relations: ['submissions'], // Load bài nộp để kiểm tra
    });

    if (!quiz) throw new NotFoundException('Không tìm thấy bài kiểm tra!');
    if (quiz.creatorId !== instructorId) throw new BadRequestException('Bạn không có quyền xóa!');
    
    // Ràng buộc: Không cho xóa nếu đã có học viên nộp bài
    if (quiz.submissions && quiz.submissions.length > 0) {
      throw new BadRequestException('Không thể xóa vì đã có học viên nộp bài!');
    }

    await this.quizzRepo.remove(quiz);
  }
}
import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Req, BadRequestException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { QuizzService } from './quizz.service';
import { CreateQuizzDto } from './quizz.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { SubmitQuizzDto } from 'src/submission/submission.dto';

@Controller('api/v1')
export class QuizzController {
    constructor(
        private readonly quizzService: QuizzService,
        private readonly firebaseService: FirebaseService, // Inject vào đây
    ) { }

    /**
     * @description Lấy danh sách tất cả bài kiểm tra/bài tập thuộc một khóa học.
     * * @example
     * GET http://localhost:3000/api/v1/courses/course-uuid-123/quizzes
     */
    @Get('courses/:courseId/quizzes')
    async getQuizzesByCourse(@Param('courseId') courseId: string) {
        return this.quizzService.findAllByCourse(courseId);
    }

    /**
     * @description Tạo một bài kiểm tra hoặc bài tập mới trong khóa học.
     * * @example
     * POST http://localhost:3000/api/v1/courses/course-uuid-123/quizzes
     * {
     * "title": "Bài tập lớn giữa kỳ",
     * "type": "assignment",
     * "timeLimit": 120,
     * "maxScore": 100,
     * "passingScore": 50
     * }
     */
    @Post('courses/:courseId/quizzes')
    async createQuizz(
        @Param('courseId') courseId: string,
        @Body() createQuizzDto: CreateQuizzDto,
        @Req() req: any,
    ) {
        // TODO: Lấy ID thật từ req.user sau khi gắn JWT Guard
        const instructorId = 'uuid-cua-giang-vien';
        return this.quizzService.createQuizz(courseId, instructorId, createQuizzDto);
    }

    /**
     * @description Xem chi tiết một bài kiểm tra (Bao gồm danh sách các câu hỏi bên trong).
     * * @example
     * GET http://localhost:3000/api/v1/quizzes/quiz-uuid-456
     */
    @Get('quizzes/:quizId')
    async getQuizzDetail(@Param('quizId') quizId: string) {
        return this.quizzService.findOneWithDetails(quizId);
    }

    /**
     * @description Chỉnh sửa thông tin bài kiểm tra (Tiêu đề, thời gian, điểm...).
     * * @example
     * PUT http://localhost:3000/api/v1/quizzes/quiz-uuid-456
     * {
     * "title": "Bài tập lớn giữa kỳ (Đã cập nhật)",
     * "timeLimit": 150
     * }
     */
    @Put('quizzes/:quizId')
    async updateQuizz(
        @Param('quizId') quizId: string,
        @Body() updateQuizzDto: Partial<CreateQuizzDto>,
        @Req() req: any,
    ) {
        const instructorId = 'uuid-cua-giang-vien'; // Giả lập
        return this.quizzService.updateQuizz(quizId, instructorId, updateQuizzDto);
    }

    /**
     * @description Xóa một bài kiểm tra (Chỉ xóa được khi chưa có học viên nào nộp bài).
     * * @example
     * DELETE http://localhost:3000/api/v1/quizzes/quiz-uuid-456
     */
    @Delete('quizzes/:quizId')
    async deleteQuizz(
        @Param('quizId') quizId: string,
        @Req() req: any,
    ) {
        const instructorId = 'uuid-cua-giang-vien'; // Giả lập
        return this.quizzService.deleteQuizz(quizId, instructorId);
    }

   
}
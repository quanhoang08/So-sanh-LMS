import { 
  Controller, Get, Post, Put, Body, Param, Req, 
  UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SubmissionService } from './submission.service';
import { 
  SubmitQuizzDto, GradeSubmissionDto, RegradeRequestDto, RegradeResponseDto 
} from './submission.dto';
import * as multer from 'multer';
import { FirebaseService } from 'src/firebase/firebase.service';

@Controller('api/v1')
export class SubmissionController {
  constructor(
    private readonly submissionService: SubmissionService,
    private readonly firebaseService: FirebaseService,
  ) {}




  /**
   * @description Giảng viên xem danh sách các bài nộp của một bài kiểm tra.
   * @example
   * GET http://localhost:3000/api/v1/quizzes/quiz-uuid-123/submissions
   */
  @Get('quizzes/:quizId/submissions')
  async getSubmissions(@Param('quizId') quizId: string) {
    return this.submissionService.getSubmissionsForQuiz(quizId);
  }

  /**
   * @description Giảng viên chấm điểm và ghi chú phản hồi cho một bài nộp.
   * @example
   * PUT http://localhost:3000/api/v1/submissions/sub-uuid-456/grade
   * {
   * "score": 8.5,
   * "feedback": "Bài làm tốt, nhưng phần giao diện cần cải thiện thêm."
   * }
   */
  @Put('submissions/:submissionId/grade')
  async gradeSubmission(
    @Param('submissionId') submissionId: string,
    @Body() gradeDto: GradeSubmissionDto,
  ) {
    return this.submissionService.gradeSubmission(submissionId, gradeDto.score, gradeDto.feedback);
  }

  /**
   * @description Học viên gửi yêu cầu chấm lại bài (Phúc khảo).
   * @example
   * POST http://localhost:3000/api/v1/submissions/sub-uuid-456/regrade
   * {
   * "reason": "Thưa thầy, em nghĩ câu 3 em đã làm đúng yêu cầu, mong thầy xem xét lại ạ."
   * }
   */
  @Post('submissions/:submissionId/regrade')
  async requestRegrade(
    @Param('submissionId') submissionId: string,
    @Body() requestDto: RegradeRequestDto,
    @Req() req: any,
  ) {
    const studentId = 'uuid-cua-hoc-vien'; // Giả lập
    return this.submissionService.requestRegrade(submissionId, studentId, requestDto.reason);
  }

  /**
   * @description Giảng viên phản hồi yêu cầu chấm lại và cập nhật điểm mới.
   * @example
   * PUT http://localhost:3000/api/v1/submissions/sub-uuid-456/regrade/respond
   * {
   * "newScore": 9.0,
   * "responseFeedback": "Thầy đã kiểm tra lại, đúng là hệ thống chấm sót ý của em. Thầy đã cộng lại điểm."
   * }
   */
  @Put('submissions/:submissionId/regrade/respond')
  async respondRegrade(
    @Param('submissionId') submissionId: string,
    @Body() responseDto: RegradeResponseDto,
  ) {
    return this.submissionService.respondRegrade(submissionId, responseDto.newScore, responseDto.responseFeedback);
  }


   /**
   * @description Học viên nộp bài kiểm tra / bài tập (Hỗ trợ upload file qua Multer).
   * @example
   * POST http://localhost:3000/api/v1/quizzes/quiz-uuid-123/submit
   * Content-Type: multipart/form-data
   * Body:
   * - answers: {"question_1": "A", "question_2": "C"} (Dạng Text/JSON)
   * - file: [Chọn file PDF/ZIP] (Dạng File)
   */
   @Post('quizzes/:quizId/submit')
    @UseInterceptors(FileInterceptor('file', {
        storage: multer.memoryStorage(),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.match(/\/(pdf|zip|x-rar-compressed|vnd.openxmlformats-officedocument.wordprocessingml.document)$/)) {
                cb(null, true);
            } else {
                cb(new BadRequestException('Định dạng file không hợp lệ!'), false);
            }
        }
    }))
    async submitQuizz(
        @Param('quizId') quizId: string,
        @Body() submitDto: SubmitQuizzDto,
        @UploadedFile() file: Express.Multer.File,
        @Req() req: any,
    ) {
        const studentId = 'uuid-cua-hoc-vien'; // Giả lập
        let fileUrl = "";

        // 🚀 LƯỚI BẢO VỆ: Đẩy file lên Firebase nếu có file đính kèm
        if (file) {
            fileUrl = await this.firebaseService.uploadFile(
                file.buffer,         // Buffer lưu trong RAM
                file.originalname,   // Tên file do user up
                file.mimetype,       // Định dạng file
                `assignments/${quizId}` // Xếp gọn vào thư mục mang mã bài tập
            );
        }

        // Sau khi có fileUrl (link Firebase), gọi Service để lưu vào Database Postgres
        return this.submissionService.submitQuizz(studentId, quizId, submitDto.answers, fileUrl);
    }
}
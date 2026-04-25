import { Controller, Get, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StudentService } from '../student/student.service';

@Controller('enrollment')
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly  studentService: StudentService // 👈
  ) { }

  // API endpoint cho Frontend gọi qua Nginx: /api//enrollment
  @UseGuards(JwtAuthGuard)
  @Get('my-dashboard')
  async getDashboardData(@CurrentUser() user: any) {
    const userId = user.id; // Đây là số 6

    const student = await this.studentService.findByUserId(userId);
    
    if (!student) {
      throw new NotFoundException(`Không tìm thấy người dùng id=${userId} có vai trò sinh viên !`);
    }

    // 2. Lấy được UUID xịn (ví dụ: '123e4567-e89b-12d3-a456-426614174000')
    const actualStudentUuid = student.id;

    // 3. Truyền UUID xịn vào hàm getStudentDashboard
    return await this.enrollmentService.getStudentDashboard(actualStudentUuid);
  }
}
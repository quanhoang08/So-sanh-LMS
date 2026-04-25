// course.controller.ts (hoặc app.message.controller.ts bên CourseService)
import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CourseService } from './course/course.service';

@Controller()
export class AppMessageController {
  constructor(private readonly courseService: CourseService) { }

  // Lắng nghe request từ AcademicService
  @MessagePattern({ cmd: 'get_courses_by_ids' })
  async getCoursesByIds(@Payload() ids: string[]) {
    console.log("📥 RECEIVED IDS FROM RMQ:", ids);
    return await this.courseService.findByIds(ids);
  }

  // Tiện thể làm thêm một pattern để lấy khóa học đang mở (trừ các môn đã học)
  @MessagePattern({ cmd: 'get_available_courses' })
  async getAvailableCourses(@Payload() excludeIds: string[]) {
    return await this.courseService.getAvailableCourses(excludeIds); // Bạn tự định nghĩa hàm này dùng Not(In(excludeIds)) và status = 'OPEN'
  }

  @MessagePattern({ cmd: 'get_upcoming_courses' })
  async getUpcomingCourses() {
    return await this.courseService.getUpcomingCourses();
  }
}
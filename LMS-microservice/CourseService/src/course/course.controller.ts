import { Controller, UseGuards, Get, Req, Post, Param, Body, Delete, Put, Patch } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateCourseDto } from "./course.dto";
import { CourseService } from "./course.service";
import { CourseStatus } from "./course.enum";
// import { EnrollmentService } from "src/enrollment/enrollment.service";

@Controller('courses')
@UseGuards(JwtAuthGuard) // Đảm bảo User đã đăng nhập
export class CourseController {
  constructor(private readonly courseService: CourseService) { }
  /**
     * Tạo một khóa học mới.
     * @example
     * POST /api/v1/course
     * Body: { "name": "Nhập môn Lập trình", "description": "Học C++ cơ bản" }
     * Response: { "id": "uuid-123", "name": "Nhập môn Lập trình", "status": "PENDING" }
     */
  @Post()
  createCourse(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  /**
   * Cập nhật thông tin cơ bản của khóa học.
   * @example
   * PUT /api/v1/course/c81d4e2e-bcf2-11ed-afa1-0242ac120002
   * Body: { "description": "Cập nhật mô tả mới nhất" }
   * Response: Khóa học đã cập nhật
   */
  @Put(':id')
  updateCourse(@Param('id') id: string, @Body() updateData: any) {
    return this.courseService.update(id, updateData);
  }

  /**
   * Xóa vĩnh viễn khóa học.
   * @example
   * DELETE /api/v1/course/c81d4e2e-bcf2-11ed-afa1-0242ac120002
   * Response: 200 OK (Void)
   */
  @Delete(':id')
  deleteCourse(@Param('id') id: string) {
    return this.courseService.delete(id);
  }

  /**
   * Lấy danh sách toàn bộ khóa học trong hệ thống.
   * @example
   * GET /api/v1/course
   * Response: [ { "id": "1", "name": "Toán rời rạc" }, ... ]
   */
  @Get()
  getAllCourses() {
    return this.courseService.findAll();
  }

  /**
   * Lấy chi tiết thông tin của một khóa học.
   * @example
   * GET /api/v1/course/c81d4e2e-bcf2-11ed-afa1-0242ac120002
   * Response: { "id": "...", "name": "Toán", "materials": [...] }
   */
  @Get(':id')
  getCourseDetail(@Param('id') id: string) {
    console.log("ID của khóa học: ",id)
    return this.courseService.fineOneWithEnrollments(id);
  }

  /**
   * API nội bộ: Lấy thông tin nhiều khóa học cùng lúc dựa trên danh sách ID.
   * Thường được gọi bởi Academic Service để hiển thị lịch học của sinh viên.
   * @example
   * POST /api/v1/course/bulk-details
   * Body: { "ids": ["uuid-1", "uuid-2"] }
   * Response: [ { "id": "uuid-1", ... }, { "id": "uuid-2", ... } ]
   */
  @Post('bulk-details')
  getBulkCourses(@Body('ids') ids: string[]) {
    return this.courseService.findByIds(ids);
  }

  /**
   * Thay đổi trạng thái khóa học (Dự kiến mở -> Đang mở -> Đã đóng).
   * Cần có quyền Giảng viên hoặc Trưởng bộ môn.
   * @example
   * PATCH /api/v1/course/c81d4e2e-bcf2-11ed-afa1-0242ac120002/status
   * Body: { "status": "OPEN", "userRole": "TRUONG_BO_MON" }
   * // Ghi chú: Thực tế userRole nên lấy từ Token (@Req() req) thay vì Body để bảo mật.
   */
  @Patch(':id/status')
  updateCourseStatus(
    @Param('id') id: string,
    @Body('status') newStatus: CourseStatus,
    @Body('userRole') userRole: string, // Hoặc lấy từ req.user.role
  ) {
    return this.courseService.updateStatus(id, newStatus, userRole);
  }

  /**
   * Xem danh sách bài giảng (materials) của một khóa học.
   * @example
   * GET /api/v1/course/c81d4e2e-bcf2-11ed-afa1-0242ac120002/materials
   * Response: [ { "id": "m1", "title": "Chương 1", "orderIndex": 1 }, ... ]
   */
  @Get(':id/materials')
  getCourseMaterials(@Param('id') courseId: string) {
    return this.courseService.getMaterialsByCourse(courseId);
  }

  @Get('my-course')
  @UseGuards(JwtAuthGuard)
  async getMyCourses(@Req() req: any) {
    // Giả sử JwtAuthGuard đã nạp thông tin user vào req.user
    const instructorId = req.user.id;
    const userRole = req.user.role;

    if (userRole === 'HEAD') {
      // Trưởng bộ môn: Thấy khóa học mình tạo + Khóa học cần duyệt
      return this.courseService.findAllForHead(instructorId);
    }
    // Giảng viên: Thấy khóa học mình tạo + Khóa học của Trưởng bộ môn cần vote
    return this.courseService.findForInstructor(instructorId);
  }
}
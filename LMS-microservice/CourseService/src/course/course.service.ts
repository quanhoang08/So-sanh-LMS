import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Not, Repository } from 'typeorm';
import { Course } from './course.entity';
import { CourseStatus } from './course.enum';
import { CreateCourseDto } from './course.dto';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CourseService implements OnModuleInit {

  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @Inject('ACADEMIC_SERVICE')
    private readonly academicClient: ClientProxy,
  ) { }

  async onModuleInit() {
    await this.academicClient.connect();
  }

  /**
   * 1. Xem danh sách khóa học
   */
  async findAll(): Promise<Course[]> {
    return await this.courseRepository.find({
      relations: [
        'lessons',
        'lessons.materials'
      ], // Load thêm quan hệ nếu cần
    });
  }


  async findOne(id: string): Promise<Course> {

    const course = await this.courseRepository.findOne({
      where: { id },
      relations: [
        'lessons',
        'lessons.materials'
      ],
    });

    if (!course) {
      throw new NotFoundException(`Không tìm thấy khóa học với ID: ${id}`);
    }
    return course


  }

  /**
   * 2. Xem chi tiết khóa học, một khóa học sẽ có các học viên trong đó, để lấy ra được các học viên
   * hàm sẽ bắn sự kiện qua rabbitmq để service academic lấy ra danh sách các enrollment entity
   * các entity này đại diện cho sự tham gia của các student và sẽ có studentId trong đó
   */
  async fineOneWithEnrollments(courseId: string): Promise<{ course: Course; enrollments: any[] }> {

    const enrollments = await firstValueFrom(
      this.academicClient.send({ cmd: 'get_enrollment_by_course_id' }, courseId),
    );
    console.log("danh sách các enrollments: ", enrollments);
    console.log("======================");
    console.log("======================");
    console.log("======================");

    const course = await this.findOne(courseId);

    return {
      course,
      enrollments,
    };
  }

  /**
   * 3. Tạo khóa học mới
   */
  async create(dto: CreateCourseDto): Promise<Course> {
    const newCourse = this.courseRepository.create({
      ...dto,
      status: CourseStatus.PENDING, // Mặc định khi tạo là Dự kiến mở
    });
    return await this.courseRepository.save(newCourse);
  }

  /**
   * 4. Thay đổi trạng thái khóa học
   * @param userRole: 'GIANG_VIEN' | 'TRUONG_BO_MON'
   */
  async updateStatus(id: string, newStatus: CourseStatus, userRole: string): Promise<Course> {
    const course = await this.findOne(id);
    const currentStatus = course.status;

    // Logic phân quyền và chuyển đổi trạng thái
    if (userRole === 'GIANG_VIEN') {
      // Giảng viên chỉ được phép thiết lập về "Dự kiến mở" (thường lúc mới tạo)
      if (newStatus !== CourseStatus.PENDING) {
        throw new ForbiddenException('Giảng viên chỉ có quyền thiết lập trạng thái Dự kiến mở');
      }
    }



    if (userRole === 'TRUONG_BO_MON') {
      const isValidTransition =
        (currentStatus === CourseStatus.PENDING && [CourseStatus.OPEN, CourseStatus.CANCELLED].includes(newStatus)) ||
        (currentStatus === CourseStatus.OPEN && newStatus === CourseStatus.CLOSED);

      if (!isValidTransition) {
        throw new BadRequestException(`Không thể chuyển từ ${currentStatus} sang ${newStatus}`);
      }
    }

    course.status = newStatus;
    return await this.courseRepository.save(course);
  }

  /**
 * Lấy danh sách khóa học đang mở, ngoại trừ các khóa học đã đăng ký
 */
  async getAvailableCourses(excludeIds: string[]): Promise<Course[]> {
    const courses = await this.courseRepository.find({
      where: { status: CourseStatus.OPEN },
      relations: [
        'lessons',
        'lessons.materials'],
    });

    // 🔥 COPY logic từ findByIds
    const instructorIds = [...new Set(courses.map(c => c.instructorId))];

    const lecturers = await firstValueFrom(
      this.academicClient.send(
        { cmd: 'get_lecturers_by_ids' },
        instructorIds
      )
    );

    const lecturerMap = {};
    lecturers.forEach(l => {
      lecturerMap[l.id] = l.fullname;
    });

    return courses.map(course => ({
      ...course,
      instructorName: lecturerMap[course.instructorId] || 'Unknown',
    }));
  }
  /**
   * 5. Xem danh sách bài giảng (Materials) trong khóa học theo thứ tự
   */
  async getMaterialsByCourse(courseId: string) {
    const course = await this.courseRepository.findOne({
      where: { id: courseId },
      relations: [
        'lessons',
        'lessons.materials'
      ],
    });

    if (!course) throw new NotFoundException('Khóa học không tồn tại');

    // Sắp xếp materials theo order_index (Giả định entity Material có field orderIndex)
    return course.materials.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
  }

  /**
   * 6. Cập nhật thông tin khóa học (Bổ sung)
   */
  async update(id: string, updateData: any): Promise<Course> {
    // Gọi hàm findOne có sẵn để kiểm tra tồn tại (tận dụng code cũ)
    await this.findOne(id);

    await this.courseRepository.update(id, updateData);
    return this.findOne(id); // Trả về data mới nhất sau khi update
  }

  /**
   * 7. Xóa khóa học (Bổ sung)
   */
  async delete(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  /**
   * 8. Lấy nhiều khóa học cùng lúc theo mảng ID (Bổ sung cho Microservices)
   */
  async findByIds(ids: string[]): Promise<any[]> {
    if (!ids || ids.length === 0) return [];

    const courses = await this.courseRepository.find({
      where: { id: In(ids) },
      relations: [
        'lessons',
        'lessons.materials'
      ],
    });

    // 1. Lấy instructorIds
    const instructorIds = [...new Set(courses.map(c => c.instructorId))];

    // 2. Gọi AcademicService
    const lecturers = await firstValueFrom(
      this.academicClient.send(
        { cmd: 'get_lecturers_by_ids' },
        instructorIds
      )
    );

    // 3. Map lại
    const lecturerMap = {};
    lecturers.forEach(l => {
      lecturerMap[l.id] = l.fullname;
    });

    // 4. Gắn vào course
    return courses.map(course => ({
      ...course,
      instructorName: lecturerMap[course.instructorId] || 'Unknown',
    }));
  }

  async getUpcomingCourses() {
    return this.courseRepository.find({
      where: { status: CourseStatus.PENDING },
    });
  }

  /**
   * Dành cho Trưởng bộ môn (HEAD)
   * Lấy khóa học của chính mình HOẶC khóa học đang chờ HEAD duyệt
   */
  async findAllForHead(instructorId: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: [
        { instructorId: instructorId }, // Điều kiện 1: Của chính mình
        { status: CourseStatus.PENDING } // Điều kiện 2: Đang chờ duyệt
      ],
      order: { createdAt: 'DESC' },
      relations: [
        'lessons',
        'lessons.materials'
      ] // Nếu bạn muốn lấy luôn danh sách tài liệu
    });
  }

  /**
   * Dành cho Giảng viên (INSTRUCTOR)
   * Lấy khóa học của chính mình HOẶC khóa học do HEAD tạo đang chờ Vote
   */
  async findForInstructor(instructorId: string): Promise<Course[]> {
    return await this.courseRepository.find({
      where: { instructorId: instructorId }, // CHỈ lấy theo ID người đăng nhập
      order: { createdAt: 'DESC' },
      relations: [
        'lessons',
        'lessons.materials'
      ]
    });
  }
}
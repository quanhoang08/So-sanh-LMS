import { Controller, Logger } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { StudentService } from './student/student.service';
import { LecturerService } from './lecturer/lecturer.service';
import { EnrollmentService } from './enrollment/enrollment.service';

@Controller() // Không để prefix api/v1 ở đây
export class AppMessageController {
  private readonly logger = new Logger(AppMessageController.name);
  constructor(
    private readonly studentService: StudentService,
    private readonly enrollmentService: EnrollmentService,
    private readonly lecturerService: LecturerService
  ) { }


  @EventPattern('user_created_for_academic')
  async handleUserCreated(@Payload() data: { id: number; email: string; fullname?: string }) {
    try {
      // KIỂM TRA TRƯỚC KHI INSERT (tránh duplicate)
      const existing = await this.studentService.findByEmail(data.email);
      if (existing) {
        console.log(`⚠️ Student với email ${data.email} đã tồn tại, bỏ qua.`);
        return;
      }

      await this.studentService.createFromAccount(data);

      console.log(`✅ Đã tạo Student cho user ID: ${data.id}`);
    } catch (e: any) {
      console.error('Lỗi đồng bộ:', e.message);
    }
  }

  @EventPattern('user_role_changed')
  async handleUserRoleChanged(@Payload() data: { id: number; email: string; oldRole: string; newRole: string }) {
    this.logger.log(`📥 [Role Changed] Nhận yêu cầu phân quyền cho User ID: ${data.id} -> ${data.newRole}`);

    try {
      // 1. Nếu Admin cấp quyền HỌC VIÊN
      if (data.newRole === 'STUDENT') {
        await this.studentService.handleRoleAssigned(data);
      }

      // 2. Nếu Admin cấp quyền GIẢNG VIÊN
      else if (data.newRole === 'LECTURER') {
        await this.lecturerService.handleRoleAssigned(data);
      }

      // (Tùy chọn) 3. Xử lý tước quyền nếu chuyển từ Sinh viên -> Giảng viên
      if (data.oldRole === 'STUDENT' && data.newRole !== 'STUDENT') {
        await this.studentService.deactivateStudent(data.id);
      }
      if (data.oldRole === 'LECTURER' && data.newRole !== 'LECTURER') {
        await this.lecturerService.deactivatelecturer(data.id);
      }

    } catch (error: any) {
      this.logger.error(`❌ Lỗi xử lý đổi Role tại Academic: ${error.message}`);
    }
  }


  /**
   * Chiến lược Lazy Synchronization: xử lý lỗi dữ liệu mất đồng bộ ở 2 service
   * thường xảy ra do con người (insert vào bảng không chính xác) hoặc do
   * hệ thống (network fail giữa chừng) dựa trên nguyên lý Single Source of Truth (Nguồn chân lý duy nhất)
   * Hệ thống sẽ không làm gì cả cho đến khi người dùng ID 47 thực hiện hành động Đăng nhập
   * Khi đó, Account Service ngoài việc trả về Token, nó sẽ bắn luôn một event qua RabbitMQ tên là 
   * user_logged_in với payload: { id: 47, email: 'tranvanquyen@student...', role: 'STUDENT' }.
   * Academic Service hứng event này và kiểm tra "sức khỏe" dữ liệu:
   * Nó thấy payload ghi Role là LECTURER.
   * Nó query tìm ID 47 trong bảng lecturers -> Không thấy!
   * Nó query tìm ID 47 trong bảng students -> Thấy có dữ liệu!
   * Hành động tự sửa lỗi: Academic Service lập tức DELETE (hoặc chuyển status thành INACTIVE) 
   * dòng dữ liệu ID 47 bên bảng students, sau đó INSERT một dòng mới tinh cho ID 47 sang bảng lecturers
   * @async
   * @param {({ id: number | number; email: string; role: string })} data 
   * @returns {*} 
   */
  @EventPattern('user_logged_in') // Hoặc tên event bạn đang dùng
  async handleUserLoggedIn(@Payload() data: { id: number; email: string; fullname: string, role?: string }) {
    try {

      if (data.role === 'STUDENT') {
        const existing = await this.studentService.findByEmail(data.email);
        const safeFullname =
          data.fullname || (data.email ? data.email.split('@')[0] : 'Học viên');

        // ❌ CASE 1: Không tồn tại → tạo mới
        if (!existing) {
          console.warn(`⚠️ Phát hiện User ${data.id} bị thiếu trong bảng Students. Đang tự động sửa lỗi...`);

          // 🛡️ LƯỚI LỌC AN TOÀN TẠI ĐÂY:
          // Nếu data.fullname là null/undefined/rỗng -> Lấy phần đầu email -> Nếu email lỗi luôn thì lấy text mặc định
          const safeFullname = data.fullname || (data.email ? data.email.split('@')[0] : 'Học viên chưa cập nhật');

          // Tạo hồ sơ bù đắp

          await this.studentService.createFromAccount({
            ...data,
            fullname: safeFullname,
          });

          console.log(`✅ Đã vá lỗi và đồng bộ thành công cho User ${data.id}`);
          return;
        }

        // ⚠️ CASE 2: TỒN TẠI nhưng BỊ LỖI (CHÍNH CASE CỦA BẠN)
        if (!existing.userId) {
          console.warn(`⚠️ Student tồn tại nhưng thiếu userId → đang vá lỗi...`);

          await this.studentService.patchUserId(existing.id, data.id);

          console.log(`✅ Đã cập nhật userId cho student ${existing.id}`);
        }
      } else { // role === 'LECTURER'
        const existing = await this.lecturerService.findByEmail(data.email);
        const safeFullname =
          data.fullname || (data.email ? data.email.split('@')[0] : 'Giảng viên');

        // ❌ CASE 1: Không tồn tại → tạo mới
        if (!existing) {
          console.warn(`⚠️ Phát hiện User ${data.id} bị thiếu trong bảng Lecturers. Đang tự động sửa lỗi...`);

          // 🛡️ LƯỚI LỌC AN TOÀN TẠI ĐÂY:
          // Nếu data.fullname là null/undefined/rỗng -> Lấy phần đầu email -> Nếu email lỗi luôn thì lấy text mặc định
          const safeFullname = data.fullname || (data.email ? data.email.split('@')[0] : 'Giảng viên chưa cập nhật');

          // Tạo hồ sơ bù đắp

          await this.lecturerService.createFromAccount({
            ...data,
            fullname: safeFullname,
          });

          console.log(`✅ Đã vá lỗi và đồng bộ thành công cho User ${data.id}`);
          return;
        }

        // ⚠️ CASE 2: TỒN TẠI nhưng BỊ LỖI (CHÍNH CASE CỦA BẠN)
        if (!existing.userId) {
          console.warn(`⚠️ Student tồn tại nhưng thiếu userId → đang vá lỗi...`);

          await this.studentService.patchUserId(existing.id, data.id);

          console.log(`✅ Đã cập nhật userId cho student ${existing.id}`);
        }
      }
    } catch (e: any) {
      console.error(`❌ Lỗi đồng bộ dữ liệu cho User ${data.id}:`, e.message);
    }
  }

  // --- LOGIC TỰ SỬA LỖI ---

  private async syncLecturerData(userId: number, email: string) {
    // 1. Kiểm tra xem đã nằm đúng bảng Giảng viên chưa
    const lecturer = this.lecturerService.findByUserId(userId);

    if (!lecturer) {
      this.logger.warn(`⚠️ Phát hiện User ${userId} bị thiếu trong bảng Lecturers. Đang tự động sửa lỗi...`);

      // 2. Dọn rác: Xóa hồ sơ sai ở bảng Học viên (nếu có)
      const wrongStudent = await this.studentService.findByUserId(userId);
      if (wrongStudent) {
        await this.studentService.hardDelete(userId); // Hoặc chuyển status thành INACTIVE tùy nghiệp vụ
        this.logger.log(`🗑️ Đã xóa hồ sơ lỗi của User ${userId} trong bảng Students.`);
      }

      // 3. Chữa lành: Tạo hồ sơ đúng bên bảng Giảng viên
      await this.lecturerService.createInitialProfile(userId, email);
      this.logger.log(`✅ Đã tạo mới hồ sơ Giảng viên cho User ${userId}.`);
    }
  }

  private async syncStudentData(userId: number, email: string) {
    // Logic tương tự nhưng ngược lại: Kiểm tra bảng Student, nếu thiếu thì xóa rác ở bảng Lecturer và tạo mới ở Student
    const student = await this.studentService.findByUserId(userId);
    if (!student) {
      this.logger.warn(`⚠️ Phát hiện User ${userId} bị thiếu trong bảng Students. Đang tự động sửa lỗi...`);

      const wrongLecturer = await this.lecturerService.findByUserId(userId);
      if (wrongLecturer) {
        await this.lecturerService.hardDelete(userId);
        this.logger.log(`🗑️ Đã xóa hồ sơ lỗi của User ${userId} trong bảng Lecturers.`);
      }

      await this.studentService.createInitialProfile(userId, email);
      this.logger.log(`✅ Đã tạo mới hồ sơ Học viên cho User ${userId}.`);
    }
  }

  @MessagePattern({ cmd: 'get_lecturers_by_ids' })
  async getLecturers(@Payload() ids: string[]) {
    console.log("📥 GET LECTURERS IDS:", ids);

    return await this.lecturerService.findByLectureIds(ids);
  }

  @MessagePattern({ cmd: 'get_enrollment_by_course_id' })
  async getEnrollmentByCourseId(@Payload() courseId: string) {
    console.log("📥 GET LECTURERS IDS:", courseId);

    return await this.enrollmentService.getAllStudentInEnrollmentById(courseId);
  }
}
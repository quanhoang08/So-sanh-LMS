import { Injectable, NotFoundException, InternalServerErrorException, Logger, Inject } from "@nestjs/common";
import { Student } from "./student.entity";
import { StudentRepository } from "./student.repository";
import { UpdateStudentDto } from "./student.dto";
import { StudentStatus } from "./student.enum";
import { ClientProxy } from "@nestjs/microservices";
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class StudentService {

  private readonly logger = new Logger(StudentService.name);

  constructor(
    private readonly studentRepo: StudentRepository,

    @Inject('RABBITMQ_SERVICE')
    private readonly rabbitClient: ClientProxy,
  ) { }

  async createFromAccount(data: { id: number; email: string; fullname?: string }): Promise<Student> {
    // 1. Kiểm tra xem sinh viên này đã tồn tại chưa (để tránh lỗi duplicate khi RabbitMQ gửi lại tin nhắn)
    const existingStudent = await this.studentRepo.findByUserId(data.id);

    if (existingStudent) {
      console.log(`⚠️ Sinh viên ID ${existingStudent.id} đã tồn tại, bỏ qua tạo mới.`);
      return existingStudent;
    }
    const studentId = uuidv4();
    const generatedCode = `STU-${studentId.padStart(4, '0')}`;
    // 2. Tạo instance mới với ID được cấp từ Account Service
    const newStudent = await this.studentRepo.create({
      id: studentId,            // QUAN TRỌNG: Dùng ID từ Account ném sang
      email: data.email,
      fullname: data.fullname || 'Học viên mới',
      status: StudentStatus.UNENROLLED,       // Trạng thái mặc định
      studentCode: generatedCode
    });

    // 3. Lưu vào database của Academic Service
    try {
      console.log(`✅ Đã lưu sinh viên mới vào DB Academic: ID ${newStudent.id}`);
      return newStudent;
    } catch (error: any) {
      console.error('❌ Lỗi lưu sinh viên từ Account:', error.message);
      throw error;
    }
  }

  async getProfileByEmail(email: string): Promise<Student> {
    const student = await this.studentRepo.findByEmail(email);
    if (!student) throw new NotFoundException('Không tìm thấy thông tin học viên.');
    return student;
  }

  // Chức năng: Cập nhật thông tin cá nhân
  async updateProfile(id: number, updateDto: UpdateStudentDto): Promise<Student> {
    const student = await this.studentRepo.findByUserId(id);
    if (!student) throw new NotFoundException('Không tìm thấy thông tin học viên.');

    // Cập nhật các trường cho phép
    let isProfileChanged = false;
    if (updateDto.fullname && updateDto.fullname !== student.fullname) {
      student.fullname = updateDto.fullname;
      isProfileChanged = true;
    }
    if (updateDto.phone) student.phone = updateDto.phone;
    if (updateDto.avatarUrl) student.avatarUrl = updateDto.avatarUrl;

    const updated = await this.studentRepo.save(student);
    if (!updated) throw new InternalServerErrorException('Cập nhật thất bại.');

    // 🚀 Bắn event sang Account Service nếu có thay đổi thông tin định danh
    if (isProfileChanged) {
      this.rabbitClient.emit('profile_updated', {
        id: updated.id,
        fullname: updated.fullname, // Bổ sung email nếu DTO của bạn cho phép đổi email
        // avatarUrl: updated.avatarUrl // Bỏ comment nếu Account Service lưu cả Avatar
      });
      this.logger.log(`🚀 Đã gửi event profile_updated cho User ID: ${updated.id}`);
    }

    return updated;
  }

  async patchUserId(studentId: string, userId: number): Promise<void> {
    const student = await this.studentRepo.findByStudentId(studentId);

    if (!student) {
      throw new NotFoundException('Student không tồn tại');
    }

    student.userId = userId;

    await this.studentRepo.save(student);
  }
  // Chức năng: Xem danh sách học viên (Toàn bộ hoặc theo khóa học)
  async getStudents(courseId?: number): Promise<Student[]> {
    let students: Student[] | null;

    if (courseId) {
      students = await this.studentRepo.findByCourseId(courseId);
    } else {
      students = await this.studentRepo.findAll();
    }

    if (!students || students.length === 0) {
      throw new NotFoundException('Danh sách học viên trống.');
    }
    return students;
  }

  /**
 * Kiểm tra Student tồn tại theo email 
 */
  async findByEmail(email: string): Promise<Student | null> {
    const student = await this.studentRepo.findByEmail(email);
    if (!student) throw new NotFoundException('Không tìm thấy thông tin học viên.');
    return student;
  }

  /**
   * Xử lý khi Admin cấp quyền STUDENT cho một User
   */
  async handleRoleAssigned(data: { id: number; email: string }) {
    const existingStudent = await this.studentRepo.findByUserId(data.id);

    if (existingStudent) {
      const studentId = existingStudent.id;
      // Nếu user này trước đây từng là sinh viên (bị khóa, giờ mở lại)
      await this.studentRepo.updateStatus(studentId, 'ACTIVE');
      this.logger.log(`✅ [Student] Kích hoạt lại hồ sơ Học viên ID: ${studentId}`);
    } else {
      // Tạo mới hồ sơ học viên
      const studentId = uuidv4();
      const generatedCode = `STU-${studentId.toString().padStart(4, '0')}`;
      const defaultName = data.email.split('@')[0];

      await this.studentRepo.create({
        id: studentId,
        email: data.email,
        fullname: defaultName,
        studentCode: generatedCode,
        status: StudentStatus.UNENROLLED,
      });
      this.logger.log(`✅ [Student] Tạo mới hồ sơ Học viên ID: ${studentId}`);
    }
  }

  /**
   * Vô hiệu hóa hồ sơ khi bị tước quyền
   */
  async deactivateStudent(studentId: number) {
    const existing = await this.studentRepo.findByUserId(studentId);
    if (existing) {
      await this.studentRepo.updateStatus(existing.id, 'INACTIVE');
      this.logger.log(`🚫 [Student] Vô hiệu hóa hồ sơ Học viên ID: ${studentId}`);
    }
  }

  async findByUserId(userId: number) {
    return await this.studentRepo.findByUserId(userId);
  }
  async findByStudentId(studentId: string) {
    return await this.studentRepo.findByStudentId(studentId);
  }


  async hardDelete(userId: number) {
    const result = await this.studentRepo.delete(userId);
    if (result.affected && result.affected > 0) {
      return { message: `Deleted student with id ${userId}` };
    } else {
      throw new NotFoundException(`Student with id ${userId} not found`);
    }
  }

  /**
   * chức năng tương tự createStudentFromUser nhưng khác ở chỗ
   * không cần fullname, phone, status, studentCode vì có thể những
   * trường này ta không biết trước. sử dung khi muốn đồng bộ dữ liệu ở 2 service
   */
  async createInitialProfile(userId: number, email: string) {
    const existingStudent = await this.findByUserId(userId);
    if (existingStudent) {
      console.log(`⚠️ Giảng viên ID ${existingStudent.id} đã tồn tại, bỏ qua tạo mới.`);
      return existingStudent;
    }
    const studentId = uuidv4();
    return this.studentRepo.create({
      id: studentId,
      email: email,
      fullname: ""
    });
  }
}
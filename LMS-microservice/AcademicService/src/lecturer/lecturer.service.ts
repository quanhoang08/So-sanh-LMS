import { Injectable, NotFoundException, InternalServerErrorException, Logger } from "@nestjs/common";
import { AssignedLecturerRepository } from "../assign-lecturer/assign-lecturer.repository";
import { Lecturer } from "./lecturer.entity";
import { LecturerRepository } from "./lecturer.repository";
import { UpdateExpertiseDto } from "./lecturer.do";
import { v4 as uuidv4 } from 'uuid';
import { Like } from "typeorm";

enum LecturerStatus{
    ACTIVE = "active",
    UNACTIVE = 'unactive'
}

@Injectable()
export class LecturerService {


  private readonly logger = new Logger(LecturerService.name);
  constructor(
    private readonly lecturerRepo: LecturerRepository,
    private readonly assignedRepo: AssignedLecturerRepository
  ) { }

  async getProfile(id: string): Promise<Lecturer> {
    const lecturer = await this.lecturerRepo.findByLecturerId(id);
    if (!lecturer) throw new NotFoundException('Giảng viên không tồn tại.');
    return lecturer;
  }

  // Chức năng: Cập nhật trình độ/Chuyên môn
  async updateExpertise(id: string, dto: UpdateExpertiseDto): Promise<Lecturer> {
    const lecturer = await this.getProfile(id);

    lecturer.degree = dto.degree;
    lecturer.specialization = dto.specialization;

    const updated = await this.lecturerRepo.save(lecturer);
    if (!updated) throw new InternalServerErrorException('Không thể cập nhật chuyên môn.');
    return updated;
  }

  // Chức năng: Thống kê hoạt động giảng dạy (Phần thuộc module Academic)
  async getTeachingStats(id: string): Promise<any> {
    await this.getProfile(id); // Check lecturer exists
    const courseCount = await this.assignedRepo.countCoursesByLecturer(id);

    return {
      lecturerId: id,
      totalAssignedCourses: courseCount || 0,
      // Lưu ý: Số bài giảng sẽ được lấy qua API Gateway từ module Curriculum
    };
  }

  async findAll(): Promise<Lecturer[]> {
    const lecturers = await this.lecturerRepo.findAll();

    if (!lecturers || lecturers.length === 0) {
      throw new NotFoundException('Danh sách giảng viên trống.');
    }

    return lecturers;
  }

  /**
   * Xử lý khi Admin cấp quyền lecturer cho một User
   */
  async handleRoleAssigned(data: { id: number; email: string }) {
    const existinglecturer = await this.lecturerRepo.findByUserId(data.id);

    if (existinglecturer) {
      // Nếu user này trước đây từng là sinh viên (bị khóa, giờ mở lại)
      await this.lecturerRepo.updateStatus(existinglecturer.id, 'ACTIVE');
      this.logger.log(`✅ [lecturer] Kích hoạt lại hồ sơ Học viên ID: ${data.id}`);
    } else {
      // Tạo mới hồ sơ học viên
      const lecturerCode = `LECT-${uuidv4().padStart(4, '0')}`;
      const defaultName = data.email.split('@')[0];

      await this.lecturerRepo.createLecturer({
        lecturerId: uuidv4(),
        email: data.email,
        fullname: defaultName,
        lecturerCode: lecturerCode
      })
      this.logger.log(`✅ [lecturer] Tạo mới hồ sơ Giảng viên ID: ${data.id}`);
    }
  }

  /**
   * Vô hiệu hóa hồ sơ khi bị tước quyền
   */
  async deactivatelecturer(userId: number) {
    const existing = await this.lecturerRepo.findByUserId(userId);
    if (existing) {
      await this.lecturerRepo.updateStatus(existing.id, 'INACTIVE');
      this.logger.log(`🚫 [lecturer] Vô hiệu hóa hồ sơ Học viên ID: ${existing.id}`);
    }
  }

  async findByUserId(userId: number) {
    return await this.lecturerRepo.findByUserId(userId);
  }


  /**
   *  Note:  Khởi tạo một đối tượng lectuer không có fullname, phone, status, studentCode vì có thể những
   * trường này ta không biết trước. sử dung khi muốn đồng bộ dữ liệu ở 2 service
   * @param userId 
   * @param email 
   * @returns 
   */
  async createInitialProfile(userId: number, email: string, fullname?: string) {
    const existingLecturer = await this.findByUserId(userId);
    if (existingLecturer) {
      console.log(`⚠️ Giảng viên ID ${existingLecturer.id} đã tồn tại, bỏ qua tạo mới.`);
      return existingLecturer;
    }
    const lecturerId = uuidv4();
    return this.lecturerRepo.createLecturer({
      lecturerId: lecturerId,
      email: email,
      fullname: fullname || "",
      lecturerCode: `LECT-${lecturerId.padStart(4, '0')}`
    })
  }

  async hardDelete(userId: number) {
    const result = await this.lecturerRepo.delete(userId);
    if (result.affected && result.affected > 0) {
      return { message: `Deleted student with id ${userId}` };
    } else {
      throw new NotFoundException(`Student with id ${userId} not found`);
    }
  }

  async findByLectureIds(ids: string[]) {
    if (!ids || ids.length === 0) return [];

    return await this.lecturerRepo.findByIds(ids);
  }

  async findByEmail(email: string) {
    return await this.lecturerRepo.findOne({
      where:{
        email: email
      }
    });
  }

  /**
   * Thuật toán sinh mã giảng viên: uuid-giangvien-001
   */
  async generateLecturerCode(): Promise<string> {
    // 1. Tạo phần UUID rút gọn (8 ký tự đầu) để mã không quá dài
    // Hoặc dùng toàn bộ uuidv4() nếu bạn muốn
    const shortUuid = uuidv4().split('-')[0]; 
    const prefix = `${shortUuid}-giangvien-`;

    // 2. Tìm mã lớn nhất có cùng prefix trong DB
    const lastLecturer = await this.lecturerRepo.findOne({
      where: {
        lecturerCode: Like(`${prefix}%`),
      },
      order: {
        lecturerCode: 'DESC', // Sắp xếp giảm dần để lấy số lớn nhất
      },
    });

    let nextNumber = 1;

    if (lastLecturer) {
      // 3. Tách lấy 3 số cuối (ví dụ: '003' -> 3)
      const lastCode = lastLecturer.lecturerCode;
      const lastNumberStr = lastCode.split('-').pop(); // Lấy phần tử cuối sau dấu gạch
      if (lastNumberStr && !isNaN(parseInt(lastNumberStr))) {
        nextNumber = parseInt(lastNumberStr) + 1;
      }
    }

    // 4. Format lại với padding 3 chữ số
    const formattedNumber = nextNumber.toString().padStart(3, '0');
    
    return `${prefix}${formattedNumber}`;
  }

  async createFromAccount(data: { id: number; email: string; fullname?: string }): Promise<Lecturer> {
      // 1. Kiểm tra xem sinh viên này đã tồn tại chưa (để tránh lỗi duplicate khi RabbitMQ gửi lại tin nhắn)
      const existingStudent = await this.lecturerRepo.findByUserId(data.id);
  
      if (existingStudent) {
        console.log(`⚠️ Giảng viên ID ${existingStudent.id} đã tồn tại, bỏ qua tạo mới.`);
        return existingStudent;
      }
      const studentId = await this.generateLecturerCode();
      const generatedCode = `STU-${studentId.padStart(4, '0')}`;
      // 2. Tạo instance mới với ID được cấp từ Account Service
      const newStudent = await this.lecturerRepo.createLecturer({
        lecturerId: studentId,            // QUAN TRỌNG: Dùng ID từ Account ném sang
        email: data.email,
        fullname: data.fullname || 'Học viên mới',
        status: LecturerStatus.ACTIVE,       // Trạng thái mặc định
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
}
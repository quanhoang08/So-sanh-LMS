

// material.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Material } from './material.entity';
import { SupabaseService } from '../supabase/supabase.service';
import * as Express from 'express';


/** @file 
 * 
 * Để quản lý các bài giảng (Material) bằng Supabase Storage, quy trình sẽ diễn ra như sau
 *   - Client gửi file (PDF, Video, Slide...) lên CourseService.
 *   - SupabaseService đẩy file đó lên Supabase Cloud và trả về một Public URL.
 *   - Bạn lưu URL đó vào cột fileUrl trong database thông thông qua Material Entity.
 *  Ở đây client thường là giảng viên - những người upload tài liệu học tập lên lms
 */
@Injectable()
export class MaterialService {
  constructor(
    @InjectRepository(Material)
    private materialRepo: Repository<Material>,
    private supabaseService: SupabaseService,
  ) {}

 async createMaterial(
  file: { buffer: Buffer; originalname: string; mimetype: string },
  name: string, 
  courseId: string, 
  orderIndex: number
) {
  try {
    // 1. Tạo tên file duy nhất (Ví dụ: 1713432000-bai-hoc.pdf)
    const uniqueFileName = `${Date.now()}-${file.originalname}`;
    const folder = `courses/${courseId}`;

    // 2. Upload lên Supabase thông qua Service dùng chung
    const fileUrl = await this.supabaseService.uploadFile(
      file.buffer,
      uniqueFileName,
      file.mimetype,
      folder
    );

    // 3. Lưu thông tin vào Database
    const newMaterial = this.materialRepo.create({
      name,
      fileUrl,
      orderIndex: Number(orderIndex), // Đảm bảo là kiểu số
      course: { id: courseId } as any, 
    });

    return await this.materialRepo.save(newMaterial);
  } catch (error) {
    // Log lỗi hoặc xử lý xóa file rác ở đây
    throw error;
  }
}

  
}




import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    // Khởi tạo Supabase Client
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL') || "",
      this.configService.get<string>('SUPABASE_KEY') || ""
    );
  }

  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string, folder: string): Promise<string> {
    try {
      const bucketName = this.configService.get<string>('SUPABASE_BUCKET') || "";
      const uniqueFileName = `${folder}/${uuidv4()}_${fileName}`;

      // 1. Đẩy file lên Supabase Storage
      const { data, error } = await this.supabase.storage
        .from(bucketName)
        .upload(uniqueFileName, fileBuffer, {
          contentType: mimeType,
          upsert: false
        });

      if (error) throw error;

      // 2. Lấy URL công khai (Nếu bạn để Bucket là Public)
      const { data: urlData } = this.supabase.storage
        .from(bucketName)
        .getPublicUrl(uniqueFileName);

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Lỗi upload Supabase:', error.message);
      throw new InternalServerErrorException('Không thể tải file lên hệ thống Supabase!');
    }
  }
}
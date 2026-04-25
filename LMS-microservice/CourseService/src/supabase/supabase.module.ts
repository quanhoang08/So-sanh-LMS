import { Module, Global } from '@nestjs/common';
import { SupabaseService } from './supabase.service';

@Global() // Giữ Module ở dạng Global để các module khác (như Course, User) dùng được ngay
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
})
export class SupabaseModule {}
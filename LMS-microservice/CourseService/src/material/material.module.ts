// material.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material } from './material.entity';
import { MaterialService } from './material.service';
import { MaterialController } from './material.controller';
import { SupabaseModule } from '../supabase/supabase.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Material]),
    SupabaseModule
  ],
  controllers: [MaterialController],
  providers: [MaterialService],
})
export class MaterialModule {}

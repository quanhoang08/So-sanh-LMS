// material.controller.ts
import { Controller, Post, UseInterceptors, UploadedFile, Body } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { MaterialService } from './material.service';

@Controller('materials')
export class MaterialController {
  constructor(private readonly materialService: MaterialService) { }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file')) // 'file' là key trong form-data
  async uploadMaterial(
    @UploadedFile() file: Express.Multer.File,
    @Body('name') name: string,
    @Body('courseId') courseId: string,
    @Body('orderIndex') orderIndex: number,
  ) {
    console.log('--- RAW DEBUG ---');
    console.log('File:', file);
    // console.log('Full Body:', body);
    // GỌI LOGIC THỰC TẾ Ở ĐÂY
    return await this.materialService.createMaterial(file, name, courseId, orderIndex);
  }
}
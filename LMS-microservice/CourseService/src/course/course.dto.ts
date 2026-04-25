import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { CourseStatus } from './course.enum';

export class CreateCourseDto {
  @IsNotEmpty({ message: 'Tiêu đề khóa học không được để trống' })
    @IsString()
    title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  // Lưu ý: instructorId thường được lấy từ JWT Token (User session) 
  // nên không nhất thiết phải gửi từ Body của Request để tránh giả mạo.
  // Tuy nhiên nếu bạn muốn gửi từ client, hãy bỏ comment dòng dưới:
  // @IsNotEmpty()
  // instructorId: string;

  @IsOptional()
  @IsEnum(CourseStatus)
  status?: CourseStatus;

  @IsOptional()
  @IsString()
  instructorId?: string
}
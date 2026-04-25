import { IsString, IsNumber, IsOptional, IsObject, IsNotEmpty, Min } from 'class-validator';

// 1. DTO cho lúc học viên nộp bài
export class SubmitQuizzDto {
  // Dùng cho bài trắc nghiệm (Dữ liệu gửi lên là JSON object)
  @IsOptional()
  @IsObject({ message: 'Đáp án phải là một Object JSON' })
  answers?: Record<string, string>; 
}

// 2. DTO cho lúc giảng viên chấm điểm
export class GradeSubmissionDto {
  @IsNumber({}, { message: 'Điểm số phải là dạng số' })
  @Min(0, { message: 'Điểm không được âm' })
  score: number;

  @IsString()
  @IsOptional()
  feedback?: string;
}

// 3. DTO cho lúc học viên xin phúc khảo
export class RegradeRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập lý do yêu cầu chấm lại' })
  reason: string;
}

// 4. DTO cho lúc giảng viên phản hồi phúc khảo
export class RegradeResponseDto {
  @IsNumber()
  @Min(0)
  newScore: number;

  @IsString()
  @IsNotEmpty({ message: 'Vui lòng nhập phản hồi cho học viên' })
  responseFeedback: string;
}
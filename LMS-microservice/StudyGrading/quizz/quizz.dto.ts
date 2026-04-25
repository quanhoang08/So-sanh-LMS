import { IsString, IsEnum, IsNumber, IsOptional, Min, IsNotEmpty } from 'class-validator';

export class CreateQuizzDto {
  @IsString({ message: 'Tiêu đề phải là chuỗi văn bản' })
  @IsNotEmpty({ message: 'Tiêu đề không được để trống' })
  title: string;

  @IsEnum(['quiz', 'assignment'], { message: 'Loại bài kiểm tra chỉ được là quiz hoặc assignment' })
  type: string;

  @IsOptional()
  @IsNumber({}, { message: 'Thời lượng phải là số' })
  @Min(1, { message: 'Thời lượng tối thiểu là 1 phút' })
  timeLimit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxScore?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  passingScore?: number;
}
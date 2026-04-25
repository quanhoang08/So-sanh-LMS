import { Column } from "typeorm";

// Định nghĩa Enum cho trạng thái
export enum CourseStatus {
  PENDING = 'Dự kiến mở',
  OPEN = 'Đã mở đăng ký',
  CANCELLED = 'Đã hủy',
  CLOSED = 'Đã đóng',
  PENDING_VOTE = "PENDING_VOTE",
  DRAFT = "DRAFT",
}


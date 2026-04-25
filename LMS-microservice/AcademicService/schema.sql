-- 1. Khởi tạo Extension cho UUID (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Khởi tạo các ENUM (để khớp với StudentStatus trong code)
CREATE TYPE "student_status_enum" AS ENUM ('UNENROLLED', 'ACTIVE', 'SUSPENDED', 'GRADUATED');

-- 3. Bảng Students
CREATE TABLE "students" (
    "id" UUID PRIMARY KEY, -- Nhận từ module Account
    "user_id" BIGINT,
    "fullname" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "phone" VARCHAR(20),
    "avatarUrl" TEXT,
    "studentCode" VARCHAR(50) NOT NULL UNIQUE,
    "status" "student_status_enum" DEFAULT 'UNENROLLED',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tạo Index cho email để tìm kiếm nhanh (như @Index trong Entity)
CREATE INDEX "IDX_student_email" ON "students" ("email");

-- 4. Bảng Lecturers
CREATE TABLE "lecturers" (
    "id" VARCHAR(20) PRIMARY KEY, -- Nhận từ module Account
    "user_id" BIGINT,
    "fullname" VARCHAR(150) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "lecturerCode" VARCHAR(50) NOT NULL UNIQUE,
    "degree" VARCHAR(255),
    "department" VARCHAR(100),
    "specialization" TEXT,
    "bio" TEXT,
    "status" VARCHAR(10),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX "IDX_lecturer_email" ON "lecturers" ("email");

-- 5. Bảng Enrollments (Bảng trung gian Student - Course)
CREATE TABLE "enrollments" (
    "id" SERIAL PRIMARY KEY,
    "student_id" UUID NOT NULL,
    "course_id" VARCHAR(20) NOT NULL, -- ID logic từ module Curriculum
    "enrollmentStatus" VARCHAR(50) DEFAULT 'ACTIVE',
    "enrolledAt" TIMESTAMPTZ NOT NULL DEFAULT now(), 
    -- Khóa ngoại trỏ đến bảng Students nội bộ
    CONSTRAINT "FK_enrollment_student" FOREIGN KEY ("student_id") 
        REFERENCES "students"("id") ON DELETE CASCADE
);

-- Index để truy vấn "Danh sách học viên của 1 khóa học" cực nhanh
CREATE INDEX "IDX_enrollment_course_student" ON "enrollments" ("course_id", "student_id");

-- 6. Bảng Assigned Lecturers (Bảng phân công giảng viên)
CREATE TABLE "assigned_lecturers" (
    "id" SERIAL PRIMARY KEY,
    "lecturer_id" VARCHAR(20) NOT NULL,
    "course_id" VARCHAR(20) NOT NULL, -- ID logic từ module Curriculum
    "target_id" UUID,           -- Cho lớp học hoặc đồ án cụ thể
    "assignmentRole" VARCHAR(50) NOT NULL,
    "semester" VARCHAR(20),
    "assignedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    CONSTRAINT "FK_assignment_lecturer" FOREIGN KEY ("lecturer_id") 
        REFERENCES "lecturers"("id") ON DELETE CASCADE
);

INSERT INTO students (id, fullname, email, phone, "avatarUrl", "studentCode", status)
VALUES
-- Sinh viên có tài khoản thực tế trong hệ thống (Từ bảng users)
('11111111-1111-1111-1111-111111111111', 'Trần Văn Quyền', 'tranvanquyen@student.tdtu.edu.vn', '0901234567', 'https://ui-avatars.com/api/?name=Tran+Van+Quyen', '52000001', 'ACTIVE'),

-- Các sinh viên giả định khác để test
('22222222-2222-2222-2222-222222222222', 'Nguyễn Thị Hương', 'nguyenthihuong@student.tdtu.edu.vn', '0912345678', 'https://ui-avatars.com/api/?name=Nguyen+Thi+Huong', '52000002', 'ACTIVE'),
('33333333-3333-3333-3333-333333333333', 'Lê Hoàng Nam', 'lehoangnam@student.tdtu.edu.vn', '0923456789', NULL, '52000003', 'ACTIVE'),
('44444444-4444-4444-4444-444444444444', 'Phạm Thị Diễm', 'phamthidiem@student.tdtu.edu.vn', '0934567890', NULL, '52000004', 'ACTIVE'),
('55555555-5555-5555-5555-555555555555', 'Vương Anh Khoa', 'vuonganhkhoa@student.tdtu.edu.vn', '0945678901', 'https://ui-avatars.com/api/?name=Vuong+Anh+Khoa', '52000005', 'ACTIVE');


INSERT INTO "enrollments" ("student_id", "course_id", "enrollmentStatus", "enrolledAt")
VALUES
-- Sinh viên 1
('11111111-1111-1111-1111-111111111111', 'BE-NESTJS-01', 'ACTIVE', '2023-09-01 08:30:00+07'),
('11111111-1111-1111-1111-111111111111', 'AG-POSTGRES-01', 'ACTIVE', '2023-09-01 08:30:00+07'),
('11111111-1111-1111-1111-111111111111', 'DSA-JAVA-01', 'UNENROLLMENT', '2023-09-01 08:30:00+07'),
('11111111-1111-1111-1111-111111111111', 'ALG-PY-01', 'ACTIVE', '2023-09-01 08:30:00+07'),
('11111111-1111-1111-1111-111111111111', 'ML-ARCH-01', 'UNENROLLMENT', '2023-09-01 08:30:00+07'),
('11111111-1111-1111-1111-111111111111', 'DNET-CSHARP-01', 'ACTIVE', '2023-09-01 08:30:00+07'),
('11111111-1111-1111-1111-111111111111', 'MS-ARCH-01', 'COMPLETED', '2023-01-15 09:00:00+07'),

-- Sinh viên 2
('22222222-2222-2222-2222-222222222222', 'BE-NESTJS-01', 'ACTIVE', '2023-09-02 10:15:00+07'),
('22222222-2222-2222-2222-222222222222', 'DB-POSTGRES-01', 'DROPPED', '2023-09-10 14:20:00+07'),
('22222222-2222-2222-2222-222222222222', 'MS-ARCH-01', 'ACTIVE', '2023-09-11 08:00:00+07'),

-- Sinh viên 3
('33333333-3333-3333-3333-333333333333', 'MS-ARCH-01', 'ACTIVE', DEFAULT),
('33333333-3333-3333-3333-333333333333', 'DB-POSTGRES-01', 'ACTIVE', DEFAULT),

-- Sinh viên 4 & 5
('44444444-4444-4444-4444-444444444444', 'BE-NESTJS-01', DEFAULT, '2023-10-01 13:45:00+07'),
('55555555-5555-5555-5555-555555555555', 'DB-POSTGRES-01', 'COMPLETED', '2023-02-20 11:10:00+07');

-- Index hỗ trợ chức năng Thống kê giảng dạy
CREATE INDEX "IDX_assignment_lecturer_course" ON "assigned_lecturers" ("lecturer_id", "course_id");

INSERT INTO lecturers ("id", "user_id", "fullname", "email", "lecturerCode", "degree", "department", "specialization", "bio", "status")
VALUES
  ('uuid-giangvien-001', 1001, 'Nguyễn Thành An', 'nguyenthanhan@example.com', 'GV001', 'Thạc sĩ CNTT', 'Công nghệ thông tin', 'Web Development', 'Giảng viên chuyên về lập trình web', 'active'),
  ('uuid-giangvien-002', 1002, 'Dung Cẩm Quang', 'tranthib@example.com', 'GV002', 'Thạc sĩ CNTT', 'Công nghệ thông tin', 'Applied Mathematics', 'Giảng viên chuyên về toán ứng dụng', 'active'),
  ('uuid-giangvien-003', 1003, 'Trương Đình Tú', 'nguyenvana2@example.com', 'GV003', 'Thạc sĩ CNTT', 'Công nghệ thông tin', 'Database Systems', 'Giảng viên phụ trách cơ sở dữ liệu', 'inactive'),
  ('uuid-giangvien-004', 1004, 'Lê Văn Vang', 'levanc@example.com', 'GV004', 'Thạc sĩ CNTT', 'Vật lý', 'Quantum Mechanics', 'Giảng viên vật lý lượng tử', 'active');






-- Kích hoạt extension để tạo UUID tự động (nếu dùng PostgreSQL bản cũ, bản 13+ có sẵn gen_random_uuid)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =======================================================
-- 1. TẠO TYPE ENUM CHO TRẠNG THÁI KHÓA HỌC
-- =======================================================
CREATE TYPE "public"."course_status_enum" AS ENUM (
  'Dự kiến mở', 
  'Đã mở đăng ký', 
  'Đã hủy', 
  'Đã đóng'
);

-- =======================================================
-- 2. TẠO BẢNG: course
-- =======================================================
CREATE TABLE "course" (
  "id" VARCHAR(20) NOT NULL DEFAULT uuid_generate_v4(),
  "title" character varying NOT NULL,
  "description" text,
  "instructorId" VARCHAR(20), -- Soft FK tới microservice User
  "status" "public"."course_status_enum" NOT NULL DEFAULT 'Dự kiến mở',
  "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
  CONSTRAINT "PK_course_id" PRIMARY KEY ("id")
);

-- =======================================================
-- 2. TẠO BẢNG: lessons (Mới - Quan hệ 1-N với course)
-- =======================================================
CREATE TABLE "lessons" (
    "id" BIGSERIAL NOT NULL,
    "course_id" VARCHAR(20) NOT NULL, -- FK khớp với course.id
    "title" VARCHAR(255) NOT NULL,
    "summary" text,
    "content" text,
    "order_index" integer NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT "PK_lessons_id" PRIMARY KEY ("id"),
    CONSTRAINT "FK_lessons_course" FOREIGN KEY ("course_id") REFERENCES "course" ("id") ON DELETE CASCADE
);

-- Tìm lesson theo khóa học và sắp xếp theo thứ tự bài học
CREATE INDEX "IDX_lessons_course_order" ON "lessons" ("course_id", "order_index");

-- Tìm tài liệu theo lesson

CREATE TABLE "materials" (
    "id" uuid NOT NULL DEFAULT uuid_generate_v4 (),
    "name" character varying NOT NULL,
    "fileUrl" character varying NOT NULL,
    "orderIndex" integer NOT NULL DEFAULT 0,
    "lesson_id" BIGSERIAL NOT NULL, -- Hard FK tới bảng course
    "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
    CONSTRAINT "PK_materials_id" PRIMARY KEY ("id"),
    CONSTRAINT "FK_materials_lesson" FOREIGN KEY ("lesson_id") REFERENCES "lessons" ("id") ON DELETE CASCADE
);

CREATE INDEX "IDX_materials_lesson_id" ON "materials" ("lesson_id");


-- =======================================================
-- 6. THIẾT LẬP INDEX (Tối ưu truy vấn - Khuyên dùng)
-- =======================================================
-- Giúp tìm kiếm danh sách khóa học của 1 học viên nhanh hơn
-- CREATE INDEX "IDX_enrollment_studentId" ON "course_enrollments" ("studentId");

-- Giúp load tài liệu của lesson nhanh hơn và tự động xếp theo orderIndex
CREATE INDEX "IDX_material_course_order" ON "materials" ("lesson_id", "orderIndex");



-- =======================================================
-- 1. CHÈN DỮ LIỆU BẢNG: course (3 records)
-- =======================================================
INSERT INTO "course" (
        "id",
        "title",
        "description",
        "instructorId",
        "status"
    )
VALUES (
        'BE-NESTJS-01',
        'Lập trình Backend với NestJS',
        'Khóa học thực chiến xây dựng API từ cơ bản đến nâng cao.',
        'uuid-giangvien-001',
        'Đã mở đăng ký'
    ),
    (
        'MS-ARCH-01',
        'Kiến trúc Microservices',
        'Tìm hiểu cách chia nhỏ hệ thống với RabbitMQ và gRPC.',
        'uuid-giangvien-002',
        'Dự kiến mở'
    ),
    (
        'DB-POSTGRES-01',
        'Cơ sở dữ liệu PostgreSQL',
        'Tối ưu hóa truy vấn và thiết kế lược đồ CSDL chuẩn.',
        'uuid-giangvien-001',
        'Đã đóng'
    ),
    (
        'EMB-ARCH-01',
        'Lập trình hệ thống nhúng',
        'Thực hiện lập trình các hệ thống nhúng trong hệ thống thông tin.',
        'uuid-giangvien-003',
        'Dự kiến mở'
    ),
    (
        'MATH-POSTGRES-01',
        'Toán ứng dụng',
        'Cơ sở lý thuyết toán trong ứng dụng thực tế',
        'uuid-giangvien-002',
        'Dự kiến mở'
    ),
    (
        'DSA-JAVA-01',
        'Cấu trúc dữ liệu và giải thuật',
        'Tìm hiểu cách triển khai các cấu trúc dữ liệu và một số thuật toán.',
        'uuid-giangvien-002',
        'Đã mở đăng ký'
    ),
    (
        'OOP-JAVA-01',
        'Lập trình hướng đối tượng',
        'Tìm hiểu về khái niệm hướng đối tượng trong lập trình.',
        'uuid-giangvien-002',
        'Đã mở đăng ký'
    ),
    (
        'ALG-PY-01',
        'Đại số tuyến tính',
        'Cơ sở lý  thuyết về vector và ma trận.',
        'uuid-giangvien-002',
        'Đã mở đăng ký'
    ),
    (
        'ML-ARCH-01',
        'Học máy',
        'Cơ sở lý  thuyết về học máy.',
        'uuid-giangvien-002',
        'Đã mở đăng ký'
    ),
    (
        'DNET-CSHARP-01',
        'Công nghệ .NET',
        'Lập trình căn bản về .NET và C#.',
        'uuid-giangvien-003',
        'Đã mở đăng ký'
    ),
    (
        'AG-POSTGRES-01',
        'Lập trình căn bản',
        'Cơ sở nền tảng cho lập trình.',
        'uuid-giangvien-001',
        'Đã mở đăng ký'
    );


INSERT INTO "lessons" (
  "course_id",
  "title",
  "summary",
  "order_index"
)
VALUES
('BE-NESTJS-01', 'Giới thiệu NestJS', 'Tổng quan framework', 1),
('BE-NESTJS-01', 'Controllers & Providers', 'Core concepts', 2),
('MS-ARCH-01', 'Monolith vs Microservices', 'So sánh kiến trúc', 1);

-- =======================================================
-- 2. CHÈN DỮ LIỆU BẢNG: materials (3 records)
-- (Liên kết với Khóa 1 và Khóa 2 thông qua courseId)
-- =======================================================
INSERT INTO "materials" (
        "id",
        "name",
        "fileUrl",
        "orderIndex",
        "lesson_id"
    )
VALUES (
        uuid_generate_v4 (),
        'Bài 1: Giới thiệu về NestJS',
        'https://s3.amazonaws.com/files/nestjs-bai1.pdf',
        1,
        1
    ),
    (
        uuid_generate_v4 (),
        'Bài 2: Controllers & Providers',
        'https://s3.amazonaws.com/files/nestjs-bai2.mp4',
        2,
        2
    ),
    (
        uuid_generate_v4 (),
        'Bài 1: Monolith vs Microservices',
        'https://s3.amazonaws.com/files/micro-bai1.pdf',
        1,
        3
    );

-- =======================================================
-- 3. CHÈN DỮ LIỆU BẢNG: course_enrollments (3 records)
-- (Học viên đăng ký học Khóa 1 và Khóa 3)
-- =======================================================
-- INSERT INTO "course_enrollments" ("id", "studentId", "courseId", "progress") VALUES
-- (uuid_generate_v4(), 'uuid-hocvien-101', '11111111-1111-1111-1111-111111111111', 50.0), -- Học viên 101 học khóa NestJS (50%)
-- (uuid_generate_v4(), 'uuid-hocvien-102', '11111111-1111-1111-1111-111111111111', 10.5), -- Học viên 102 học khóa NestJS (10.5%)
-- (uuid_generate_v4(), 'uuid-hocvien-101', '33333333-3333-3333-3333-333333333333', 100.0); -- Học viên 101 đã hoàn thành khóa PostgreSQL (100%)
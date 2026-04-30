# So Sánh Hiệu Năng: Kiến Trúc Monolithic vs Microservices trên Hệ Thống LMS

> **Dự án nghiên cứu** nhằm đo lường và so sánh hiệu năng (throughput, latency, CPU) giữa hai kiến trúc phần mềm phổ biến: **Monolithic** và **Microservices** trong bối cảnh hệ thống quản lý học tập (LMS – Learning Management System).

---

## Mục lục

1. [Tổng quan dự án](#1-tổng-quan-dự-án)
2. [Cấu trúc thư mục](#2-cấu-trúc-thư-mục)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Yêu cầu môi trường](#4-yêu-cầu-môi-trường)
5. [Hướng dẫn triển khai chi tiết](#5-hướng-dẫn-triển-khai-chi-tiết)
   - [Bước 1 – Chuẩn bị môi trường](#bước-1--chuẩn-bị-môi-trường)
   - [Bước 2 – Khởi động kiến trúc Monolithic (Docker)](#bước-2--khởi-động-kiến-trúc-monolithic-docker)
   - [Bước 3 – Khởi động kiến trúc Microservices (Docker)](#bước-3--khởi-động-kiến-trúc-microservices-docker)
   - [Bước 4 – Chạy Benchmark So Sánh (Native)](#bước-4--chạy-benchmark-so-sánh-native)
   - [Bước 5 – Vẽ biểu đồ kết quả](#bước-5--vẽ-biểu-đồ-kết-quả)
   - [Bước 6 – Dọn dẹp môi trường](#bước-6--dọn-dẹp-môi-trường)
6. [Hướng dẫn nhanh (One-Click)](#6-hướng-dẫn-nhanh-one-click)
7. [Cách đọc kết quả benchmark](#7-cách-đọc-kết-quả-benchmark)
8. [Xử lý lỗi thường gặp](#8-xử-lý-lỗi-thường-gặp)

---

## 1. Tổng quan dự án

### Mục tiêu nghiên cứu

Dự án thực hiện **đo điểm hiệu năng (benchmarking)** khách quan giữa hai phong cách kiến trúc:

| Tiêu chí | Monolithic | Microservices |
|---|---|---|
| Cấu trúc | Một ứng dụng duy nhất | Nhiều dịch vụ độc lập |
| Cơ sở dữ liệu | Một PostgreSQL chung | Mỗi service có DB riêng |
| Giao tiếp nội bộ | Gọi hàm trực tiếp | RabbitMQ (message broker) |
| API Gateway | Không có | Nginx làm reverse proxy |
| Triển khai | Docker Compose (2 container) | Docker Compose (10+ container) |

### Luồng benchmark tổng quát

```
                ┌──────────────┐
                │   k6 Script  │  (công cụ tạo tải - native)
                │  (test.js)   │
                └──────┬───────┘
                       │ HTTP Request + Header X-Benchmark-Target
                       ▼
          ┌────────────────────────┐
          │  Benchmark Router      │  Port 5000
          │  (Docker / Native)     │  Đọc header để phân luồng
          └────────┬───────┬───────┘
                   │       │
         [monolith]│       │[microservices]
                   ▼       ▼
          ┌─────────┐   ┌──────────────┐
          │Monolith │   │ API Gateway  │
          │:3001    │   │ (Nginx):8080 │
          └────┬────┘   └──────┬───────┘
               │               │ Route theo path
          ┌────┴────┐    ┌─────┴──────────────────┐
          │PostgreSQL│   │AccountSvc│CourseSvc│AcademicSvc│
          └─────────┘   └──────────┴─────────┴───────────┘
```

---

## 2. Cấu trúc thư mục

```
DuAnCntt/
├── LMS-monolithic/           # Kiến trúc Monolithic (NestJS)
│   ├── src/                  # Source code NestJS
│   ├── Dockerfile            # Build image cho backend
│   ├── docker-compose.yml    # Khởi động backend + PostgreSQL
│   ├── 01-init.sh            # Script khởi tạo DB schema
│   ├── seed.sql              # Dữ liệu mẫu
│   └── .env                  # Biến môi trường (Supabase, DB, JWT)
│
├── LMS-microservice/         # Kiến trúc Microservices (NestJS)
│   ├── AccountService/       # Service quản lý tài khoản (Port 3001)
│   │   ├── Dockerfile
│   │   ├── schema.sql
│   │   └── .env
│   ├── AcademicService/      # Service học thuật - enrollment (Port 3000)
│   │   ├── Dockerfile
│   │   └── schema.sql
│   ├── CourseService/        # Service quản lý khoá học (Port 3002)
│   │   ├── Dockerfile
│   │   └── schema.sql
│   ├── StudyGrading/         # Module câu hỏi / quiz / bài nộp
│   ├── frontend-gateway/     # Frontend Vite (Port 5173)
│   ├── nginx.conf            # Cấu hình API Gateway (Nginx)
│   └── docker-compose.yml    # Toàn bộ microservices stack
│
└── benchmark/                # Công cụ so sánh hiệu năng
    ├── docker-compose.benchmark.yml  # Chạy cả 2 stack + router bằng Docker
    ├── native-router.js              # Router native (Node.js)
    ├── one-click-comparison.ps1      # Script tất cả trong một
    ├── export-benchmark.ps1          # Script benchmark chính
    ├── start-native-router.ps1       # Khởi động native router
    ├── stop-native-router.ps1        # Dừng native router
    ├── validate-run-output.ps1       # Kiểm tra kết quả đầu ra
    ├── plot_results.py               # Vẽ biểu đồ bằng Python
    ├── k6/test.js                    # Kịch bản tải (read/write/mixed)
    ├── nginx.benchmark-router.conf   # Cấu hình nginx router (Docker mode)
    └── results/                      # Kết quả benchmark được lưu ở đây
```

---

## 3. Kiến trúc hệ thống

### 3.1 Kiến trúc Monolithic

```
┌─────────────────────────────────────┐
│         LMS-monolithic (NestJS)     │
│  ┌──────────┐  ┌──────────────────┐ │
│  │Auth/User │  │Course/Lesson/    │ │
│  │Module    │  │Material Module   │ │
│  └──────────┘  └──────────────────┘ │
│  ┌──────────┐  ┌──────────────────┐ │
│  │Enrollment│  │Academic Module   │ │
│  │Module    │  │(Student/Lecturer)│ │
│  └──────────┘  └──────────────────┘ │
│              Port 3001               │
└─────────────┬───────────────────────┘
              │
   ┌──────────▼──────────┐
   │  PostgreSQL DB      │  Port 5432
   │  (LMS-monolithic)   │
   └─────────────────────┘
```

### 3.2 Kiến trúc Microservices

```
                    ┌─────────────┐
                    │  Frontend   │  Port 5173
                    │  (Vite)     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ API Gateway │  Port 8080 / 18080
                    │   (Nginx)   │
                    └──┬───┬───┬──┘
                       │   │   │
          ┌────────────┘   │   └──────────────┐
          ▼                ▼                   ▼
 ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
 │AccountService │ │CourseService  │ │AcademicService│
 │   Port 3001   │ │   Port 3002   │ │   Port 3000   │
 └───────┬───────┘ └───────┬───────┘ └───────┬───────┘
         │                 │                   │
   ┌─────▼────┐      ┌─────▼────┐       ┌─────▼────┐
   │accounts_db│     │course_db │       │lms_academic│
   │(Postgres) │     │(Postgres)│       │(Postgres)  │
   └──────────┘      └──────────┘       └────────────┘
         │                 │                   │
         └─────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  RabbitMQ   │  Port 5672 / 15672
                    │(Message Bus)│
                    └─────────────┘
```

---

## 4. Yêu cầu môi trường

| Phần mềm | Phiên bản tối thiểu | Mục đích |
|---|---|---|
| **Docker Desktop** | 24.x trở lên | Chạy container các kiến trúc |
| **Docker Compose** | V2 (tích hợp trong Docker Desktop) | Orchestrate nhiều container |
| **Node.js** | 18.x trở lên | Chạy native router benchmark |
| **k6** | 0.49 trở lên | Công cụ tạo tải HTTP |
| **Python** | 3.9 trở lên | Vẽ biểu đồ kết quả |
| **PowerShell** | 5.1+ (Windows) | Chạy script điều phối |

### Cài đặt công cụ cần thiết

```powershell
# Kiểm tra Docker
docker --version
docker compose version

# Kiểm tra Node.js
node --version

# Cài k6 trên Windows (qua winget)
winget install k6 --source winget
# Hoặc tải trực tiếp: https://k6.io/docs/get-started/installation/

# Sau khi cài k6, mở terminal mới và kiểm tra
k6 version

# Cài thư viện Python cho vẽ biểu đồ
python -m pip install pandas matplotlib
```

---

## 5. Hướng dẫn triển khai chi tiết

> ⚠️ **Lưu ý quan trọng**: Cần chạy **cả 2 kiến trúc bằng Docker trước**, sau đó mới chạy benchmark bằng công cụ native (k6 + PowerShell).

---

### Bước 1 – Chuẩn bị môi trường

#### 1.1 Clone / giải nén dự án

```powershell
# Đường dẫn gốc dự án (thay đổi nếu cần)
$PROJECT_ROOT = "C:\Users\Quan Hoang\Downloads\DuAnCntt"
```

#### 1.2 Kiểm tra file `.env` của Monolithic

File `LMS-monolithic/.env` cần có các biến:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=quanminh08
DB_NAME=LMS-monolithic
JWT_SECRET=minhquan04

# Supabase (cho upload tài liệu)
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
SUPABASE_STORAGE_BUCKET=materials
```

#### 1.3 Kiểm tra file `.env` của Microservices

File `LMS-microservice/.env` (gốc):

```env
API_GATEWAY_PORT=18080
```

Mỗi service cũng có `.env` riêng:
- `LMS-microservice/AccountService/.env`
- `LMS-microservice/CourseService/.env`
- `LMS-microservice/AcademicService/.env`

---

### Bước 2 – Khởi động kiến trúc Monolithic (Docker)

```powershell
# Di chuyển vào thư mục monolithic
cd "C:\Users\Quan Hoang\Downloads\DuAnCntt\LMS-monolithic"

# Build image và khởi động các container (backend + PostgreSQL)
docker compose up -d --build
```

**Các container được tạo:**

| Container | Image | Port |
|---|---|---|
| `lms_backend` | Node.js 20 (NestJS) | `3001:3001` |
| `monolithic-posrgre_lms-1` | postgres:15-alpine | `5432:5432` |

**Kiểm tra trạng thái:**

```powershell
docker compose ps
docker compose logs -f backend
```

**Xác nhận hoạt động:**

```powershell
# Chờ khoảng 30-60 giây để DB khởi động và seed xong
curl.exe http://localhost:3001/api/v1/courses
# Kết quả mong đợi: HTTP 200 hoặc 401
```

---

### Bước 3 – Khởi động kiến trúc Microservices (Docker)

```powershell
# Di chuyển vào thư mục microservices
cd "C:\Users\Quan Hoang\Downloads\DuAnCntt\LMS-microservice"

# Build image và khởi động tất cả services
docker compose up -d --build
```

**Các container được tạo (10 container):**

| Container | Vai trò | Port host |
|---|---|---|
| `rabbitmq` | Message broker | `5672`, `15672` |
| `account_db` | PostgreSQL cho AccountService | – |
| `account_service` | NestJS AccountService | `3101:3001` |
| `course_db` | PostgreSQL cho CourseService | – |
| `course_service` | NestJS CourseService | `3202:3002` |
| `academic_db` | PostgreSQL cho AcademicService | – |
| `academic_service` | NestJS AcademicService | – |
| `lms_frontend` | Vite Frontend | `5173:5173` |
| `api_gateway` | Nginx Gateway | `18080:80` |

**Kiểm tra trạng thái:**

```powershell
docker compose ps
docker compose logs -f api-gateway
```

**Xác nhận hoạt động:**

```powershell
# Chờ khoảng 60-90 giây để tất cả services healthy
curl.exe http://localhost:18080/api/v1/courses
# Kết quả mong đợi: HTTP 200 hoặc 401
```

> 💡 **RabbitMQ Management UI**: Truy cập `http://localhost:15672` (user: `guest` / pass: `guest`) để xem message queue.

---

### Bước 4 – Chạy Benchmark So Sánh (Native)

> Sau khi cả hai kiến trúc đã chạy ổn định, thực hiện benchmark bằng script native trên Windows.

```powershell
# Di chuyển vào thư mục benchmark
cd "C:\Users\Quan Hoang\Downloads\DuAnCntt\benchmark"
```

#### 4.1 Khởi động Native Router (cầu nối benchmark)

Router này lắng nghe trên cổng `5000`, đọc header `X-Benchmark-Target` để phân luồng request sang đúng kiến trúc.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\start-native-router.ps1 `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:18080 `
  -Port 5000
```

Log của router được lưu tại:
- `.router-state\native-router.out.log`
- `.router-state\native-router.err.log`
- `.router-state\native-router.pid`

#### 4.2 Kiểm tra endpoint trước khi benchmark

```powershell
# Kiểm tra trực tiếp từng service
curl.exe -s -o NUL -w "%{http_code}`n" http://127.0.0.1:3001/api/v1/courses
curl.exe -s -o NUL -w "%{http_code}`n" http://127.0.0.1:18080/api/v1/courses

# Kiểm tra qua router theo từng nhánh header
curl.exe -s -o NUL -w "%{http_code}`n" -H "X-Benchmark-Target: monolith"      http://127.0.0.1:5000/api/v1/courses
curl.exe -s -o NUL -w "%{http_code}`n" -H "X-Benchmark-Target: microservices"  http://127.0.0.1:5000/api/v1/courses
```

Kết quả mong đợi: tất cả trả về `200` hoặc `401`.

#### 4.3 Chạy benchmark nhanh (kiểm tra nhanh / smoke test)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\export-benchmark.ps1 `
  -Runs 1 `
  -ScenarioType concurrent `
  -WorkloadType read `
  -UserLevels "10,20" `
  -ConcurrentDuration "20s" `
  -SampleIntervalSec 2 `
  -CaseCooldownSec 1 `
  -BaseUrl http://localhost:5000
```

#### 4.4 Chạy benchmark đầy đủ (dành cho báo cáo)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\export-benchmark.ps1 `
  -Runs 3 `
  -ScenarioType concurrent `
  -WorkloadType read `
  -UserLevels "1,5,10,15,20,50" `
  -ConcurrentDuration "2m" `
  -SampleIntervalSec 2 `
  -CaseCooldownSec 2 `
  -BaseUrl http://localhost:5000
```

**Giải thích tham số:**

| Tham số | Ý nghĩa | Giá trị mẫu |
|---|---|---|
| `-Runs` | Số lần lặp cho mỗi mức người dùng | `3` |
| `-UserLevels` | Danh sách số VU (Virtual User) | `"1,5,10,15,20,50"` |
| `-ScenarioType` | Kiểu tải: `ramp` (tăng dần) hoặc `concurrent` (đồng thời) | `concurrent` |
| `-WorkloadType` | Loại workload: `read`, `write`, `mixed` | `read` |
| `-ConcurrentDuration` | Thời gian chạy mỗi case | `2m` |
| `-SampleIntervalSec` | Chu kỳ lấy mẫu CPU (giây) | `2` |
| `-CaseCooldownSec` | Thời gian nghỉ giữa các case (giây) | `2` |
| `-BaseUrl` | Địa chỉ ingress benchmark | `http://localhost:5000` |

**Kết quả được lưu tại:**

```
benchmark/results/run-YYYYMMDD-HHMMSS/
├── benchmark-summary.csv        ← Tổng hợp theo từng case
├── benchmark-all-runs.csv       ← Tất cả runs chi tiết
├── *-monolith-summary.json      ← Metric k6 của monolith
├── *-microservices-summary.json ← Metric k6 của microservices
├── *-k6.log                     ← Log chi tiết từng run
└── *-cpu-samples.csv            ← Mẫu CPU theo thời gian
```

#### 4.5 Dừng native router sau khi benchmark

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\stop-native-router.ps1
```

---

### Bước 5 – Vẽ biểu đồ kết quả

```powershell
cd "C:\Users\Quan Hoang\Downloads\DuAnCntt\benchmark"

# Vẽ chart cho run mới nhất
python .\plot_results.py --results-dir .\results --formats png,jpg

# Vẽ chart cho một run cụ thể
python .\plot_results.py --run-dir .\results\run-YYYYMMDD-HHMMSS --formats png
```

Biểu đồ được tạo gồm: **Throughput (RPS)**, **Latency (avg / p95 / p99)**, **CPU Usage (%)**.

---

### Bước 6 – Dọn dẹp môi trường

```powershell
# Dừng Monolithic
cd "C:\Users\Quan Hoang\Downloads\DuAnCntt\LMS-monolithic"
docker compose down

# Dừng Microservices
cd "C:\Users\Quan Hoang\Downloads\DuAnCntt\LMS-microservice"
docker compose down

# Xoá toàn bộ volume dữ liệu (nếu cần reset DB)
docker compose down -v
```

---

## 6. Hướng dẫn nhanh (One-Click)

Script `one-click-comparison.ps1` tự động hoá toàn bộ: verify endpoint → start router → chạy benchmark.

> ⚠️ **Yêu cầu**: Cả 2 kiến trúc phải đã được khởi động bằng Docker trước khi chạy script này.

### Chế độ `info` – chỉ kiểm tra endpoint, không chạy benchmark

```powershell
cd "C:\Users\Quan Hoang\Downloads\DuAnCntt\benchmark"
powershell -NoProfile -ExecutionPolicy Bypass -File .\one-click-comparison.ps1 `
  -Mode info `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:18080 `
  -RouterPort 5000
```

### Chế độ `quick` – smoke test nhanh (10, 20 VUs / 20 giây)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\one-click-comparison.ps1 `
  -Mode quick `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:18080 `
  -RouterPort 5000
```

### Chế độ `full` – đầy đủ cho báo cáo (1→50 VUs / 2 phút)

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\one-click-comparison.ps1 `
  -Mode full `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:18080 `
  -RouterPort 5000
```

### Nếu router đã chạy sẵn, thêm flag `-NoStartRouter`

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\one-click-comparison.ps1 `
  -Mode full `
  -NoStartRouter `
  -MonolithBaseUrl http://127.0.0.1:3001 `
  -MicroservicesBaseUrl http://127.0.0.1:18080 `
  -RouterPort 5000
```

---

## 7. Cách đọc kết quả benchmark

### Chỉ số chính

| Chỉ số | Ý nghĩa | Giá trị tốt |
|---|---|---|
| `rps` / `rps_avg` | Throughput – số request mỗi giây | **Càng cao càng tốt** |
| `avg_ms` | Độ trễ trung bình (ms) | **Càng thấp càng tốt** |
| `p95_ms` | 95% request dưới ngưỡng này (ms) | **Càng thấp càng tốt** |
| `p99_ms` | 99% request dưới ngưỡng này (ms) | **Càng thấp càng tốt** |
| `avg_cpu_percent` | CPU host trung bình trong lúc chạy | **Càng thấp = tiết kiệm tài nguyên hơn** |
| `http_req_failed` | Tỷ lệ request lỗi | **Phải < 5%** |

### Validate kết quả đầu ra

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\validate-run-output.ps1 `
  -RunDir .\results\run-YYYYMMDD-HHMMSS
```

---

## 8. Xử lý lỗi thường gặp

| Lỗi | Nguyên nhân | Cách khắc phục |
|---|---|---|
| `Không tìm thấy lệnh 'k6'` | k6 chưa cài hoặc chưa có trong PATH | Cài k6 và mở lại terminal |
| `Endpoint chưa sẵn sàng` (503/Connection refused) | Service Docker chưa healthy | Chờ thêm, kiểm tra `docker compose ps` |
| `Fail-fast: http_req_failed > 5%` | Backend quá tải hoặc có lỗi | Kiểm tra `*-k6.log`, giảm `UserLevels` |
| `cannot allocate memory` | Thiếu RAM khi chạy nhiều container + k6 | Đóng ứng dụng khác, giảm `UserLevels` |
| Port `18080` bị sai (microservices) | Nhầm cổng 8080 và 18080 | Luôn truyền rõ `-MicroservicesBaseUrl http://127.0.0.1:18080` |
| Container name conflict | Container cũ chưa xóa | Chạy `docker compose down` trước khi `up` |
| DB chưa có dữ liệu | Script `01-init.sh` / `seed.sql` chưa chạy | Xóa volume và chạy lại: `docker compose down -v && docker compose up -d --build` |

---

## Tóm tắt luồng triển khai

```
[1] Cài đặt: Docker, Node.js, k6, Python
       ↓
[2] docker compose up -d --build   (trong LMS-monolithic/)
       ↓
[3] docker compose up -d --build   (trong LMS-microservice/)
       ↓
[4] Chạy start-native-router.ps1   (trong benchmark/)
       ↓
[5] Verify endpoint (curl hoặc one-click -Mode info)
       ↓
[6] Chạy export-benchmark.ps1      (hoặc one-click -Mode full)
       ↓
[7] python plot_results.py         → Xuất biểu đồ PNG/JPG
       ↓
[8] docker compose down            (dọn dẹp)
```

---

*README được tạo để phục vụ báo cáo môn học – So sánh hiệu năng kiến trúc Monolithic vs Microservices.*

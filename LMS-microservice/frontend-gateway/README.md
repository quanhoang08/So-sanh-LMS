# 🚀 Frontend LMS - Báo cáo Cập nhật & Cải tiến Kiến trúc
Tài liệu này tổng hợp các cơ chế cốt lõi, thuật toán và giải pháp kỹ thuật đã được tích hợp vào hệ thống Frontend để đảm bảo tính bảo mật, hiệu năng và trải nghiệm người dùng (UX) tối ưu.

📂 Cấu trúc Thư mục Hiện tại
```ts
src/
├── api/                      # 🛠️ Nơi cấu hình Axios Client dùng chung
│   └── axios-client.ts       # (Tái sử dụng từ services/api.ts)
├── components/               # 🧩 UI Components dùng chung toàn app (Button, Input, Layout)
│   ├── Navbar.tsx
│   └── Sidebar.tsx
├── features/                 # 🚀 TRỌNG TÂM: Chia theo nghiệp vụ
│   ├── auth/                 # Tính năng liên quan Account Service
│   │   ├── components/       # AdminLoginForm.tsx (chuyển từ components/ sang)
│   │   ├── pages/            # AdminLoginPage.tsx (chuyển từ pages/ sang)
│   │   └── types/            # auth.types.ts (chuyển từ types/ sang)
│   └── academic/             # Tính năng liên quan Academic Service
│       ├── students/         # (Sau này thêm vào đây)
│       └── course/          # (Sau này thêm vào đây)
├── contexts/                 # 🔐 Global State (Giữ nguyên)
│   └── AuthContext.tsx
├── routes/                   # 🛣️ Định tuyến (Giữ nguyên)
│   └── ProtectedRoute.tsx
├── pages/                    # 🏠 Nơi chứa các trang tổng hợp (Dashboard)
│   └── DashboardPage.tsx
├── App.tsx
└── main.tsx
```

## 🛡️ 1. Cơ chế Bảo mật & Phân quyền (RBAC - Role-Based Access Control)
Hệ thống hiện tại áp dụng cơ chế bảo mật nhiều lớp từ UI (giao diện) cho đến Routing (điều hướng) để chống lại các hành vi leo thang đặc quyền.

- Role-Based Routing Guard (Bảo vệ cấp độ URL): Cơ chế này được thiết kế thông qua component <ProtectedRoute>. Thuật toán sẽ đối chiếu thuộc tính allowedRoles của từng Route với user.role hiện tại (lấy từ Context). Nếu tập hợp quyền không khớp, hệ thống ngay lập tức đánh chặn (intercept) và đẩy người dùng về /admin/dashboard (hoặc /admin nếu chưa đăng nhập), triệt tiêu hoàn toàn rủi ro người dùng gõ trực tiếp URL nhạy cảm lên trình duyệt.

- Dynamic Sidebar Filtering (Render Menu Động):
Nguyên tắc "Least Privilege UI" (Giao diện đặc quyền tối thiểu) được áp dụng. Mảng danh sách menu được đi qua hàm .filter() để kiểm tra roles.includes(user.role). Những menu không thuộc thẩm quyền sẽ bị loại bỏ khỏi Virtual DOM trước khi render, giúp giao diện gọn gàng và an toàn.

##⚡ 2. Thuật toán Xử lý Dữ liệu (Phân trang & Tìm kiếm)
Trang Quản lý Người dùng (UsersPage) hiện đang áp dụng kiến trúc Client-Side Data Processing để mang lại trải nghiệm 0ms delay.

- Real-time Search (Tìm kiếm thời gian thực):
Sử dụng hàm .filter() của JavaScript để so khớp chuỗi toLowerCase().includes(). Mỗi phím người dùng gõ vào, danh sách sẽ được tính toán lại ngay lập tức trên RAM mà không cần gọi thêm API. Khi có sự kiện search, hệ thống tự động trigger thuật toán Reset Pagination về Trang 1 để tránh lỗi "trống dữ liệu" ở các trang sau.

- Client-Side Pagination (Phân trang tại Client):
    + Thay vì phụ thuộc vào Server, thuật toán nội suy được áp dụng để cắt mảng dữ liệu:
    + Tính tổng số trang: totalPages = Math.ceil(filteredData.length / itemsPerPage)
    + Xác định điểm neo: indexOfLastItem và indexOfFirstItem dựa trên currentPage.
    + Trích xuất dữ liệu hiển thị: Dùng hàm .slice(start, end) để bóc tách chính xác N bản ghi cần render cho trang hiện tại.

## 🔌 3. Cơ chế Tích hợp API (Networking)

- Axios Interceptors:
Toàn bộ request gửi đi đều đi qua một "trạm kiểm soát" trung tâm (axiosClient). Tại đây, Token từ LocalStorage sẽ được tự động đính kèm vào Header (Authorization: Bearer <token>). Cơ chế này giúp mã nguồn ở các Page (như DashboardPage, UsersPage) sạch sẽ hoàn toàn, không cần lặp lại logic xử lý token ở mỗi lần gọi API.

- Robust Data Mapping:
Bảo vệ Frontend khỏi sự cố sập API hoặc sai lệch cấu trúc dữ liệu từ Backend. Dữ liệu trả về được validate và map an toàn qua cấu trúc Optional Chaining (?.) và Fallback Values (|| '0'), đảm bảo UI không bao giờ bị Crash (White Screen of Death) khi dữ liệu bị undefined.

- 🎨 4. Cải tiến UI/UX & Hiệu năng Giao diện
Skeleton Loading (Trạng thái chờ thông minh):
Thay vì sử dụng các vòng quay (Spinner) nhàm chán hoặc để trống màn hình khi chờ API, hệ thống sử dụng cơ chế Skeleton Loaders (animate-pulse). Cơ chế này vẽ trước các khối hình giả lập khung xương của Table hoặc Card, giúp giảm thiểu "Tỉ lệ rời bỏ" (Bounce Rate) do cảm giác chờ đợi.

- Consistent Dark Theme (Đồng bộ Giao diện Tối):
Sử dụng hệ thống màu chuẩn mực (background #0d1117, surface #161b22, text #c9d1d9) giúp bảo vệ mắt, tăng tính chuyên nghiệp và đồng bộ từ trang Đăng nhập, Dashboard, đến trang 404 Not Found.

- Micro-interactions (Tương tác siêu nhỏ):
Các trạng thái của người dùng (Active, Inactive, Suspended) không chỉ phân biệt bằng màu nền mà còn tích hợp các "Status Indicators" (chấm tròn phát sáng), nâng cao khả năng nhận diện thị giác (Visual Hierarchy).

===========================================================

Trong thiết kế UX/UI hiện đại (nhất là với Single Page Application như React), nguyên tắc vàng là: Hạn chế tối đa việc chuyển trang nếu không thực sự cần thiết. Việc bắt người dùng nhảy sang một trang mới /admin/users/add chỉ để điền một cái form ngắn, sau đó lại bắt họ quay về /admin/users sẽ làm gián đoạn luồng làm việc (workflow) và tốn thời gian tải.

Do đó, bạn hoàn toàn có thể (và nên) tận dụng chính trang UsersPage hiện tại để gắn các API từ AdminController thông qua các component dạng Pop-up (Modal) hoặc Menu thả xuống (Dropdown).

Dưới đây là sơ đồ "bắt cặp" các hàm trong AdminController của bạn với các thành phần UI trên trang UsersPage một cách chuẩn mực nhất:

1. Nút "Thêm người dùng" (Góc trên bên phải)
API tương ứng: POST /api/v1/admin/users (hoặc /create_user)

Cách tích hợp (UX): Khi bấm vào nút này, thay vì chuyển trang, ta sẽ làm mờ nền màn hình hiện tại và hiện ra một cái Modal (Pop-up) ở giữa màn hình. Modal này chứa form điền Email, Password, và chọn Role. Bấm "Lưu" -> Gọi API -> Đóng Modal -> Bảng tự động hiện thêm người mới.

2. Nút "Ba chấm" (Cột Hành động ở mỗi hàng)
Nút này sinh ra chính là để chứa một Dropdown Menu (Menu ngữ cảnh). Khi click vào, nó sẽ xổ ra các lựa chọn kết nối với các API cập nhật/xóa:

✏️ Chỉnh sửa / Phân quyền:

API: PUT /api/v1/admin/change_role

UI: Mở một Modal nhỏ để chọn Role mới (Admin, Teacher, Student) từ một thẻ Select, sau đó gọi API cập nhật.

🔒 Khóa tài khoản (Suspend / Ban):

API: PUT /api/v1/admin/change_status

UI: Gọi API ngay lập tức, chuyển cột "Trạng thái" từ ACTIVE (Xanh) sang SUSPENDED (Đỏ).

🗑️ Xóa người dùng:

API: DELETE /api/v1/admin/users/:id

UI: Mở một Modal cảnh báo đỏ chót: "Bạn có chắc chắn muốn xóa user này không?". Nếu chọn "Có" -> Gọi API -> Hàng đó bốc hơi khỏi bảng.

3. Cột "Tìm kiếm theo email..." (Ô Search)
API tương ứng: GET /api/v1/admin/list_users?search=xyz

Tình trạng hiện tại: Chúng ta đang dùng Client-side search (lọc trên RAM). Nhưng nếu AdminController của bạn đã có sẵn API search trên Database (giúp tìm được cả những user không nằm trong 5 người đang hiển thị), ta sẽ nối API vào đây. Cứ gõ phím là gọi API (có dùng kỹ thuật Debounce để tránh spam server).

🎯 Bước tiếp theo: Triển khai cái nào trước?
Giao diện UsersPage của bạn đã có sẵn "bộ khung" tuyệt vời, giờ chỉ việc đắp thêm logic. Theo kinh nghiệm của tôi, tính năng mang lại cảm giác "đã" nhất và quan trọng nhất lúc này là Chức năng Thêm Người Dùng.

Bạn có muốn tôi viết mã nguồn cho một cái Modal "Thêm người dùng" (Dark Mode cực mượt) bật lên khi bấm nút "Thêm người dùng" không? Hay bạn muốn làm Menu thả xuống cho nút Ba chấm trước?
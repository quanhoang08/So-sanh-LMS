import axios from 'axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';


// Định nghĩa các trạng thái khớp với Backend Enum
enum CourseStatus {
  PENDING_HEAD_APPROVAL = 'PENDING_HEAD_APPROVAL',
  PENDING_VOTE = 'PENDING_VOTE',
  APPROVED = 'APPROVED'
}

interface CourseUI {
  id: string;
  title: string;
  instructorId: string;
  status: CourseStatus;
  votes: number;
  description?: string;
}

const PAGE_SIZE = 6;

const STATUS_MAP: Record<string, string> = {
  "Dự kiến mở": "PENDING_HEAD_APPROVAL",
  "Đã mở đăng ký": "APPROVED",
  "Đang lấy ý kiến": "PENDING_VOTE",
  "Đã đóng": "CLOSED",
  "Đã hủy": "CANCELLED"
};

const mapBackendStatusToKey = (backendStatus: string): string => {
  return STATUS_MAP[backendStatus] || "UNKNOWN";
};

export default function ClassManagement() {
  const [courses, setCourses] = useState<CourseUI[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  // Giả định role lấy từ AuthContext hoặc Token
  const role = 'HEAD'; // Hoặc 'INSTRUCTOR'

  // 1. Thuật toán phân trang
  const totalPages = Math.max(1, Math.ceil(courses.length / PAGE_SIZE));
  const paginatedData = courses.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  // 2. useEffect - Gọi API qua Gateway
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem('access_token'); // Lấy JWT

        // GỌI VÀO API GATEWAY (PORT 8080)
        const response = await axios.get('http://localhost:8080/api/v1/courses/', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        // Data Binding: Map dữ liệu từ backend vào state
        setCourses(response.data || []);
      } catch (error) {
        console.error("Lỗi fetch dữ liệu:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // 3. Hàm tạo khóa học (Gửi lên Backend)
  const handleCreateCourse = async () => {
    const title = prompt("Tên khóa học mới:");
    if (!title) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post('http://localhost:8080/api/v1/courses',
        { title, description: "" },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const mappedCourses = response.data.map((course: { status: string; votes: any; }) => ({
        ...course,
        // Mapping lại status nếu Backend trả về tiếng Việt mà FE dùng Key
        uiStatus: mapBackendStatusToKey(course.status),
        // Đảm bảo votes luôn là số để không bị NaN
        votes: course.votes || 0
      }));

      // Cập nhật UI ngay lập tức với dữ liệu thật từ Server
      setCourses([response.data, ...courses]);
      alert("Tạo thành công!");
    } catch (error) {
      alert("Không thể tạo khóa học!");
    }
  };

  // Render Badge trạng thái
  const renderStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case CourseStatus.APPROVED:
        return <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm">Đang hoạt động</span>;
      case CourseStatus.PENDING_HEAD_APPROVAL:
        return <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">Chờ duyệt (Head)</span>;
      case CourseStatus.PENDING_VOTE:
        return <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">Đang lấy ý kiến</span>;
    }
  };

  const navigate = useNavigate();

  const handleCardClick = (courseId: string) => {
    navigate(`/staff/classes/${courseId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent, courseId: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      navigate(`/staff/classes/${courseId}`);
    }
  };
  if (loading) return <div className="p-10 text-white">Đang tải dữ liệu...</div>;

  return (
    <div className="p-6 text-white bg-[#0d1117] min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">Quản lý Khóa học thực tế</h1>
        <button
          onClick={handleCreateCourse}
          className="bg-[#238636] hover:bg-[#2ea043] px-4 py-2 rounded-lg font-medium transition-all"
        >
          + Tạo khóa học mới
        </button>
      </div>

      {/* Grid hiển thị dữ liệu đã phân trang */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {paginatedData.map(course => (
          <div
            key={course.id}
            role="link"
            tabIndex={0}
            onClick={() => handleCardClick(course.id)}
            onKeyDown={(e) => handleKeyDown(e, course.id)}
            className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 flex flex-col hover:border-[#8b949e] transition-all">
            <div className="mb-4">
              <span className="text-xs text-gray-500 uppercase tracking-wider">ID: {course.id}</span>
              <h3 className="text-lg font-semibold mt-1">{course.title}</h3>
            </div>

            <div className="mb-6">
              {renderStatusBadge(course.status)}
              {course.status === CourseStatus.PENDING_VOTE && (
                <p className="text-xs text-gray-400 mt-2">Tiến độ vote: {course.votes}/3</p>
              )}
            </div>

            <div className="mt-auto pt-4 border-t border-[#30363d] flex gap-2">
              <button className="bg-[#21262d] hover:bg-[#30363d] px-3 py-1.5 rounded text-sm flex-1">
                Chi tiết
              </button>
              <button className="bg-red-900/20 text-red-400 hover:bg-red-900/40 px-3 py-1.5 rounded text-sm">
                Xóa
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Điều hướng phân trang (UI Pagination) */}
      <div className="flex justify-center items-center gap-4 mt-10">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="p-2 bg-[#21262d] rounded-md disabled:opacity-30"
        >
          <ChevronLeft />
        </button>
        <span className="text-sm">Trang {currentPage} / {totalPages}</span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          className="p-2 bg-[#21262d] rounded-md disabled:opacity-30"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

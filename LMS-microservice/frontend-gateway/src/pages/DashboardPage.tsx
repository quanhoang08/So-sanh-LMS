import { useEffect, useState } from 'react';
import axiosClient from '../api/axios-client';
import Sidebar from '../components/Sidebar';
// import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';

interface StatItem {
  label: string;
  value: string | number; // Có thể là số hoặc chữ
  detail: string;
  color: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const { user } = useAuth();
  useEffect(() => {
    // 🎯 HÀM GỌI API LẤY THỐNG KÊ
    const fetchDashboardStats = async () => {
      try {
        setIsLoadingStats(true);

        // axiosClient sẽ tự động thêm 'http://localhost:8080' và Token vào header
        const response = await axiosClient.get('/api/v1/admin/stats');
        const apiData = response.data.data;;

        // 🔄 MAPPING DỮ LIỆU TỪ API VÀO GIAO DIỆN DỰA TRÊN ROLE
        if (user?.role === 'ADMIN') {
          setStats([
            {
              label: 'Tổng người dùng',
              value: apiData.totalUsers || '0',
              detail: 'Toàn hệ thống',
              color: 'text-blue-400'
            },
            {
              label: 'Tổng số Học viên',
              value: apiData.totalStudents || '0',
              detail: 'Tài khoản Student',
              color: 'text-green-400'
            },
            {
              label: 'Tổng số Giảng viên',
              value: apiData.totalLecturers || '0',
              detail: 'Tài khoản Lecturer',
              color: 'text-orange-400'
            },
            {
              label: 'Phòng ban / Khoa',
              value: apiData.totalDepartments || '0',
              detail: 'Cơ cấu tổ chức',
              color: 'text-purple-400'
            },
          ]);
        }
        else if (user?.role === 'TEACHER' || user?.role === 'ACADEMIC_MANAGER') {
          setStats([
            { label: 'Học viên của tôi', value: apiData.myStudents || '0', detail: 'Đang theo học', color: 'text-blue-400' },
            { label: 'Khóa học của tôi', value: apiData.activeCourses || '0', detail: 'Đang diễn ra', color: 'text-green-400' },
            { label: 'Bài kiểm tra', value: apiData.pendingGrades || '0', detail: 'Đang chờ chấm', color: 'text-orange-400' },
            { label: 'Câu hỏi học viên', value: apiData.unreadQuestions || '0', detail: 'Cần giải đáp', color: 'text-purple-400' },
          ]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu Dashboard:", error);
        // Nếu API lỗi (hoặc chưa code xong Backend), hiển thị dữ liệu mặc định để không vỡ UI
        setStats([
          { label: 'Lỗi kết nối', value: 'N/A', detail: 'Không lấy được dữ liệu', color: 'text-red-400' }
        ]);
      } finally {
        setIsLoadingStats(false);
      }
    };

    // Chỉ gọi API nếu đã có thông tin user
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  return (
    // Đổi bg sang Slate-950 (chuẩn GitHub Dark)
    <div className="flex min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <Sidebar />
      <div className="flex-1 ml-64">
        {/* Navbar */}
        {/* <Navbar /> */}

        <main className="pt-20 px-8 pb-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome section */}
            <div className="mb-10 border-b border-[#30363d] pb-6">
              <h1 className="text-3xl font-semibold text-white">Dashboard Quản trị</h1>
              <p className="text-[#8b949e] mt-2">
                Chào mừng, <span className="text-blue-400 font-medium">{user?.email}</span>.
                Bạn đang quản trị hệ thống LMS với quyền <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 border border-purple-500/30 rounded text-sm">{user?.role}</span>.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {isLoadingStats ? (
                // Hiển thị 4 thẻ mờ nhấp nháy trong lúc chờ API trả về
                Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="bg-[#161b22] p-6 rounded-lg border border-[#30363d] animate-pulse">
                    <div className="h-4 bg-[#30363d] rounded w-1/2 mb-4"></div>
                    <div className="h-8 bg-[#30363d] rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-[#30363d] rounded w-1/3"></div>
                  </div>
                ))
              ) : (
                // Hiển thị dữ liệu thật khi API đã tải xong
                stats.map((stat, idx) => (
                  <div key={idx} className="bg-[#161b22] p-6 rounded-lg border border-[#30363d] hover:border-[#8b949e] transition-colors">
                    <h3 className="text-sm font-medium text-[#8b949e] uppercase tracking-wider">{stat.label}</h3>
                    <p className={`text-3xl font-bold mt-2 ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-[#8b949e] mt-2">{stat.detail}</p>
                  </div>
                ))
              )}
            </div>

            {/* Section chi tiết */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div className="bg-[#161b22] rounded-lg border border-[#30363d]">
                <div className="p-4 border-b border-[#30363d]">
                  <h3 className="font-semibold text-white">Hoạt động gần đây</h3>
                </div>
                <div className="p-4">
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-sm">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                      <div className="flex-1">
                        <p className="text-[#c9d1d9]">Admin tạo khóa học mới: <span className="text-blue-400 italic">"React Advanced"</span></p>
                        <span className="text-xs text-[#8b949e]">2 giờ trước</span>
                      </div>
                    </li>
                    <li className="flex items-start gap-3 text-sm border-t border-[#30363d]/50 pt-4">
                      <div className="w-2 h-2 mt-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                      <div className="flex-1">
                        <p className="text-[#c9d1d9]">Người dùng mới đăng ký hệ thống</p>
                        <span className="text-xs text-[#8b949e]">3 giờ trước</span>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>

              {/* System Health */}
              <div className="bg-[#161b22] rounded-lg border border-[#30363d] p-6 flex flex-col justify-center items-center text-center">
                <div className="w-16 h-16 rounded-full bg-green-900/20 border border-green-500/30 flex items-center justify-center mb-4">
                  <div className="w-4 h-4 rounded-full bg-green-500 animate-pulse"></div>
                </div>
                <h3 className="text-lg font-semibold text-white">Hệ thống ổn định</h3>
                <p className="text-[#8b949e] text-sm mt-2 max-w-[250px]">
                  Tất cả các Microservices (Account, Academic) đang hoạt động bình thường qua Gateway 8080.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
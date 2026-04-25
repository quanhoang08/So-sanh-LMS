import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Book, Clock, CheckCircle, PlusCircle } from 'lucide-react';
import axios from 'axios';

// 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (INTERFACE)
interface CourseUI {
  id: string;
  title: string;
  instructorName: string;
  credits: number;
  status?: string;
}

interface DashboardState {
  registeredCourses: CourseUI[];
  availableCourses: CourseUI[];
}

const PAGE_SIZE = 6;

const paginate = (data: CourseUI[], page: number) => {
  const start = (page - 1) * PAGE_SIZE;
  return data.slice(start, start + PAGE_SIZE);
};

const getTotalPages = (data: CourseUI[]) => {
  return Math.max(1, Math.ceil(data.length / PAGE_SIZE));
};


export default function StudentCourseList() {
  const navigate = useNavigate();
  // 2. TRUYỀN INTERFACE VÀO USESTATE BẰNG CÚ PHÁP <DashboardState>
  const [dashboardData, setDashboardData] = useState<DashboardState>({
    registeredCourses: [], // ACTIVE + COMPLETED
    availableCourses: [], // UNENROLLMENT
  });

  const getTotalPages = (data: CourseUI[]) => {
    return Math.max(1, Math.ceil(data.length / PAGE_SIZE));
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Lấy token sinh viên đã lưu lúc đăng nhập thành công
        const token = localStorage.getItem('access_token');

        // Nhớ thay số port của api-gateway cho đúng nhé (VD: 3000 hoặc 8080)
        // Bỏ '/api/academic' đi
        const response = await axios.get('http://localhost:8080/api/v1/enrollment/my-dashboard', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        console.log("🔥 RAW RESPONSE:", response);
        console.log("🔥 DATA:", response.data);

        setDashboardData({
          registeredCourses: response.data.registeredCourses || [],
          availableCourses: response.data.availableCourses || [],
        });

      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu khóa học:", error);
        // navigate('/login');
      }
    };

    fetchCourses();
  }, []);



  // TRÍCH XUẤT DỮ LIỆU TỪ STATE Ở ĐÂY
  const { registeredCourses, availableCourses} = dashboardData;
  const [registeredPage, setRegisteredPage] = useState(1);
  const [availablePage, setAvailablePage] = useState(1);
  const [upcomingPage, setUpcomingPage] = useState(1);


  const totalRegisteredPages = getTotalPages(registeredCourses);

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-white mb-6 border-b border-[#30363d] pb-4">Quản lý Khóa học</h1>

      {/* SECTION 1: KHÓA HỌC ĐÃ ĐĂNG KÝ */}
      <div className="mb-10">
        <h2 className="text-lg font-semibold text-[#c9d1d9] mb-4 flex items-center">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
          Khóa học của tôi (Đã đăng ký)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[320px]">
          {paginate(registeredCourses, registeredPage).map(course => (
            <div key={course.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 hover:border-[#8b949e] transition-all flex flex-col">
              <div className="flex justify-between items-start mb-3">
                <div>Mã khóa học: </div>
                <span className="px-2 py-1 text-xs font-medium bg-[#1f6feb]/20 text-[#58a6ff] rounded-md border border-[#1f6feb]/30">
                  {course.id}
                </span>
                <span className="text-xs text-[#8b949e] flex items-center"><Clock className="w-3 h-3 mr-1" /> {course.credits} Tín chỉ</span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{course.title}</h3>
              <p className="text-[#8b949e] text-sm mb-4">GV: {course.instructorName}</p>

              <div className="mt-auto pt-4 border-t border-[#30363d]">
                <button
                  onClick={() => navigate(`/student/course/${course.id}`)}
                  className="w-full py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] font-medium rounded-md transition-colors"
                >
                  Vào lớp học
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            onClick={() => setRegisteredPage(p => Math.max(p - 1, 1))}
            disabled={registeredPage === 1}
            className={`px-3 py-1 rounded ${registeredPage === 1
              ? "bg-[#161b22] text-[#8b949e] cursor-not-allowed"
              : "bg-[#21262d] hover:bg-[#30363d]"
              }`}
          >
            ◀
          </button>

          <span className="text-[#c9d1d9] text-sm">
            Trang {registeredPage} / {totalRegisteredPages}
          </span>

          <button
            onClick={() =>
              setRegisteredPage(p => Math.min(p + 1, totalRegisteredPages))
            }
            disabled={registeredPage === totalRegisteredPages}
            className={`px-3 py-1 rounded ${registeredPage === totalRegisteredPages
              ? "bg-[#161b22] text-[#8b949e] cursor-not-allowed"
              : "bg-[#21262d] hover:bg-[#30363d]"
              }`}
          >
            ▶
          </button>
        </div>
      </div>

      {/* SECTION 2: KHÓA HỌC CHƯA ĐĂNG KÝ (MỞ LỚP) */}
      <div>
        <h2 className="text-lg font-semibold text-[#c9d1d9] mb-4 flex items-center">
          <PlusCircle className="w-5 h-5 text-blue-500 mr-2" />
          Khóa học đang mở đăng ký
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginate(availableCourses, availablePage).map(course => (
            <div key={course.id} className="bg-[#0d1117] border border-[#30363d] rounded-lg p-3 flex flex-col opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-3">
                <span className="px-2 py-1 text-xs font-medium bg-[#30363d] text-[#c9d1d9] rounded-md">
                  {course.id}
                </span>
                <span className="text-xs text-[#8b949e] flex items-center"><Book className="w-3 h-3 mr-1" /> {course.credits} Tín chỉ</span>
              </div>
              <h3 className="text-[#c9d1d9] font-bold text-lg mb-1">{course.title}</h3>
              <p className="text-[#8b949e] text-sm mb-4">GV: {course.instructorName}</p>

              <div className="mt-auto pt-4 border-t border-[#30363d]">
                <button className="w-full py-2 bg-[#238636] hover:bg-[#2ea043] text-white font-medium rounded-md transition-colors">
                  Đăng ký ngay
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center items-center gap-3 mt-4">
          <button
            onClick={() => setRegisteredPage(p => Math.max(p - 1, 1))}
            disabled={registeredPage === 1}
            className={`px-3 py-1 rounded ${registeredPage === 1
              ? "bg-[#161b22] text-[#8b949e] cursor-not-allowed"
              : "bg-[#21262d] hover:bg-[#30363d]"
              }`}
          >
            ◀
          </button>

          <span className="text-[#c9d1d9] text-sm">
            Trang {registeredPage} / {totalRegisteredPages}
          </span>

          <button
            onClick={() =>
              setRegisteredPage(p => Math.min(p + 1, totalRegisteredPages))
            }
            disabled={registeredPage === totalRegisteredPages}
            className={`px-3 py-1 rounded ${registeredPage === totalRegisteredPages
              ? "bg-[#161b22] text-[#8b949e] cursor-not-allowed"
              : "bg-[#21262d] hover:bg-[#30363d]"
              }`}
          >
            ▶
          </button>
        </div>
      </div>
    </div>
  );
}
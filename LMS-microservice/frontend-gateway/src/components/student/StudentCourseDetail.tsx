

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, FileText } from "lucide-react";

// 1. INTERFACE (contract với backend)
interface MaterialUI {
  id: number;
  title: string;
  size: string;
}

interface CourseDetailState {
  courseName: string;
  teacher: string;
  materials: MaterialUI[];
}

export default function StudentCourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // 2. STATE
  const [courseData, setCourseData] = useState<CourseDetailState>({
    courseName: "",
    teacher: "",
    materials: [],
  });

  // 3. FETCH API
  useEffect(() => {
    const fetchCourseDetail = async () => {
      try {
        const token = localStorage.getItem("access_token");

        const response = await axios.get(
          `http://localhost:8080/api/v1/courses/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("🔥 RAW:", response);
        console.log("🔥 DATA:", response.data);

        // mapping data (data binding)
        setCourseData({
          courseName: response.data.name,
          teacher: response.data.teacher,
          materials: response.data.materials || [],
        });

      } catch (error) {
        console.error("Lỗi khi lấy course detail:", error);
      }
    };

    fetchCourseDetail();
  }, [id]);

  // 4. DESTRUCTURING
  const { courseName, teacher, materials } = courseData;

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b border-[#30363d] pb-4">
        <button
          onClick={() => navigate("/student/courses")}
          className="p-2 bg-[rgb(33,38,45)] border border-[#30363d] rounded-md text-[#c9d1d9] hover:bg-[#30363d] hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">
            {courseName || "Đang tải..."}
          </h1>
          <p className="text-[#8b949e]">
            Mã môn: {id} • Giảng viên: {teacher || "Đang tải..."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ✅ Cột trái: MATERIALS (chiếm toàn bộ logic) */}
        <div className="lg:col-span-3 space-y-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#1f6feb]" />
            Nội dung khóa học
          </h2>

          <div className="space-y-4">
            {materials.length > 0 ? (
              materials.map((item) => (
                <div
                  key={item.id}
                  className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="text-[#c9d1d9] font-medium text-lg mb-1">
                      {item.title}
                    </h3>
                    <p className="text-[#8b949e] text-sm">
                      Dung lượng: {item.size}
                    </p>
                  </div>

                  <button className="bg-[#1f6feb] hover:bg-[#388bfd] text-white px-4 py-2 rounded-md font-medium transition-colors whitespace-nowrap">
                    Xem tài liệu
                  </button>
                </div>
              ))
            ) : (
              <p className="text-[#8b949e] text-sm">
                Chưa có tài liệu nào.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
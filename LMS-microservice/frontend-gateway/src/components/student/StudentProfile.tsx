import React, { useEffect, useState } from 'react';
import { User, Mail, BookOpen, GraduationCap, MapPin, Phone, Edit } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function StudentProfile() {
  console.log('🔵 StudentProfile component mounted'); // ← Thêm đây

  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🟢 useEffect fetchProfile started'); // ← Thêm đây

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        console.log('Token:', token); // 👈 Debug xem có token không

        if (!token) {
          setError('Không tìm thấy token. Vui lòng đăng nhập lại.');
          setLoading(false);
          return;
        }

        const response = await axios.get(
          'http://localhost:8080/api/v1/students/profile',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        console.log('🟣 Response:', response.data); // ← Thêm đây
        // 🔥 THÊM Ở ĐÂY
        console.log("🟣 FULL RESPONSE:", response);
        console.log("🟢 DATA:", response.data);
        // ✅ QUAN TRỌNG
        setStudentInfo(response.data);
        setLoading(false);

      } catch (err: any) {
        console.error('Chi tiết lỗi:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Không thể tải hồ sơ');
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) return <div className="p-8 text-white">Đang tải hồ sơ...</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!studentInfo) return null;
  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-6 border-b border-[#30363d] pb-4">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <User className="w-6 h-6 text-[#1f6feb]" /> Hồ sơ cá nhân
        </h1>
        <button
          onClick={() => navigate('/student/edit')}
          className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Edit className="w-4 h-4" /> Cập nhật hồ sơ
        </button>
      </div>

      {/* Cảnh báo */}
      <div className="bg-yellow-900/20 border border-yellow-700/50 text-yellow-500 px-4 py-3 rounded-md mb-8 flex justify-between items-start">
        <p className="text-sm">Vui lòng kiểm tra kỹ thông tin cá nhân. Nếu có sai sót, hãy liên hệ Phòng Đại học trước ngày 15/05/2026.</p>
        <button className="text-yellow-500/70 hover:text-yellowz-500 font-bold ml-4">&times;</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái: Avatar & Basic Info */}
        <div className="col-span-1">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6 flex flex-col items-center text-center">

            {/* Logic hiển thị Avatar: Có hình thì hiện, không thì lấy chữ cái đầu */}
            <div className="w-32 h-32 rounded-full border-4 border-[#30363d] mb-4 overflow-hidden bg-[#0d1117] flex items-center justify-center">
              {studentInfo.avatarUrl ? (
                <img
                  src={studentInfo.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-4xl font-bold text-[#8b949e]">
                  {studentInfo.fullName.charAt(0).toUpperCase()}
                </span>
              )}
            </div>

            <h2 className="text-xl font-bold text-white mb-1">{studentInfo.fullName}</h2>

            <p className="text-[#8b949e] font-mono bg-[#21262d] px-3 py-1 rounded-full text-sm mb-4">
              MSSV: {studentInfo.studentCode}
            </p>

            {/* Logic hiển thị Badge Status dựa trên API */}
            {studentInfo.status === 'UNENROLLED' ? (
              <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-4 py-1.5 rounded-md text-sm font-medium w-full block">
                Chưa ghi danh khóa nào
              </span>
            ) : (
              <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-1.5 rounded-md text-sm font-medium w-full block">
                Trạng thái: Đang học
              </span>
            )}

          </div>
        </div>

        {/* Cột phải: Detailed Info */}
        <div className="col-span-1 md:col-span-2">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-[#c9d1d9] mb-4 border-b border-[#30363d] pb-2">
              Thông tin chi tiết
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-[#8b949e] text-sm flex items-center gap-2 mb-1">
                  <GraduationCap className="w-4 h-4" /> Khoa chủ quản
                </p>
                <p className="text-white font-medium">{studentInfo.faculty}</p>
              </div>

              <div>
                <p className="text-[#8b949e] text-sm flex items-center gap-2 mb-1">
                  <BookOpen className="w-4 h-4" /> Ngành học
                </p>
                <p className="text-white font-medium">{studentInfo.major} ({studentInfo.course})</p>
              </div>

              <div>
                <p className="text-[#8b949e] text-sm flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" /> Email sinh viên
                </p>
                <p className="text-white font-medium">{studentInfo.email}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-x-6  mt-6">
              <div>
                <p className="text-[#8b949e] text-sm flex items-center gap-2 mb-1">
                  <Phone className="w-4 h-4" /> Số điện thoại
                </p>
                <p className="text-white font-medium">{studentInfo.phone}</p>
              </div>

              <div>
                <p className="text-[#8b949e] text-sm flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4" /> Địa chỉ liên hệ
                </p>
                <p className="text-white font-medium">{studentInfo.address}</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
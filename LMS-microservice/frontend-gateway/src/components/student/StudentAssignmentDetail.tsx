import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, FileText, CheckCircle, AlertCircle, Award, Target, Link2 } from 'lucide-react';

// Giả lập dữ liệu một bài tập cụ thể. 
// Trong thực tế, bạn sẽ gọi API dựa trên params.id.
const mockAssignmentData: any = {
  id: '5',
  title: 'Báo cáo Giữa kỳ - Phát triển Ứng dụng Web',
  courseName: 'IT004 - Phát triển Ứng dụng Web',
  maxPoints: 100,
  description: `Xây dựng một ứng dụng web Single Page Application (SPA) đơn giản sử dụng React.
Các tính năng yêu cầu:
1. Đăng nhập/Đăng ký.
2. Quản lý danh sách (CRUD).
3. Responsive design.
4. Nộp link GitHub và Link Deployment.`,
  // 🚀 MẸO TEST: Đặt deadline này chỉ cách thời điểm hiện tại vài giây/phút để test bộ đếm
  // Ví dụ: Lấy thời gian hiện tại cộng thêm 5 phút
  deadline: new Date(Date.now() + 5 * 60 * 1000).toISOString(), 
  submissionStatus: 'pending',
};

// Kiểu dữ liệu cho thời gian còn lại
interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export default function StudentAssignmentDetail() {
  const { id } = useParams(); // Lấy ID bài tập từ URL (VD: IT001)
  const navigate = useNavigate();
  const [submissionLink, setSubmissionLink] = useState('');

  // --- LOGIC BỘ ĐẾM THỜI GIAN (COUNTDOWN) ---
  const calculateTimeLeft = (deadlineString: string): TimeLeft => {
    const difference = new Date(deadlineString).getTime() - Date.now();
    
    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isExpired: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft(mockAssignmentData.deadline));

  useEffect(() => {
    // Nếu đã hết giờ, không cần chạy timer nữa
    if (timeLeft.isExpired) return;

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(mockAssignmentData.deadline));
    }, 1000);

    // Dọn dẹp interval khi component unmount
    return () => clearInterval(timer);
  }, [timeLeft.isExpired]);

  return (
    <div className="animate-in fade-in duration-300 pb-10">
      {/* 🚀 BANNER THÔNG BÁO HẾT GIỜ (Thay thế Alert) */}
      {timeLeft.isExpired && (
        <div className="bg-red-900/40 border border-red-700/60 text-red-300 px-5 py-4 rounded-xl mb-8 flex items-center gap-3 shadow-xl animate-in shake duration-500">
          <AlertCircle className="w-6 h-6 text-red-500" />
          <div>
            <h4 className="font-bold text-lg">Đã Hết Thời Gian Nộp Bài!</h4>
            <p className="text-sm">Bài tập này đã quá hạn. Hệ thống đã tự động khóa nộp bài.</p>
          </div>
        </div>
      )}

      {/* Header & Nút Back */}
      <div className="flex items-center gap-4 mb-8 border-b border-[#30363d] pb-5">
        <button 
          onClick={() => navigate('/student/assignments')}
          className="p-2.5 bg-[#21262d] border border-[#30363d] rounded-md text-[#c9d1d9] hover:bg-[#30363d] hover:text-white transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className="text-sm font-mono bg-[#30363d] text-[#c9d1d9] px-2.5 py-1 rounded">
            ID: {id} • {mockAssignmentData.courseName}
            
          <h1 className="text-3xl font-extrabold text-white mt-2 leading-tight"></h1>
            {mockAssignmentData.title}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* CỘT TRÁI: MÔ TẢ & YÊU CẦU */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-7">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2 mb-5">
              <FileText className="w-5 h-5 text-[#1f6feb]" /> Mô tả & Yêu cầu bài tập
            </h2>
            <div className="text-[#c9d1d9] space-y-3 leading-relaxed whitespace-pre-line text-[15px]">
              {mockAssignmentData.description}
            </div>
          </div>
        </div>

        {/* CỘT PHẢI: BỘ ĐẾM & NỘP BÀI */}
        <div className="space-y-8">
          {/* 🚀 BỘ ĐẾM THỜI GIAN NGƯỢC */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-7 shadow-lg">
            <h2 className="text-lg font-semibold text-[#c9d1d9] mb-5 flex items-center gap-2">
              <Clock className="w-5 h-5" /> {timeLeft.isExpired ? 'Hạn nộp bài' : 'Thời gian còn lại'}
            </h2>
            
            {timeLeft.isExpired ? (
              <div className="text-center bg-[#21262d] border border-[#30363d] py-5 rounded-lg text-red-400 font-medium">
                Quá hạn: {mockAssignmentData.deadline}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-3 text-center">
                {[
                  { label: 'Ngày', value: timeLeft.days },
                  { label: 'Giờ', value: timeLeft.hours },
                  { label: 'Phút', value: timeLeft.minutes },
                  { label: 'Giây', value: timeLeft.seconds },
                ].map(unit => (
                  <div key={unit.label} className={`border border-[#30363d] rounded-lg py-3 ${
                    timeLeft.hours < 1 && timeLeft.days === 0 ? 'bg-orange-950/20 border-orange-700/50' : 'bg-[#0d1117]'
                  }`}>
                    <p className={`text-3xl font-bold leading-tight ${
                      timeLeft.hours < 1 && timeLeft.days === 0 ? 'text-orange-400' : 'text-white'
                    }`}>{String(unit.value).padStart(2, '0')}</p>
                    <p className="text-xs text-[#8b949e] uppercase mt-1 tracking-wider">{unit.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* KHU VỰC NỘP BÀI */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-7">
            <h2 className="text-lg font-semibold text-[#c9d1d9] mb-5 flex items-center gap-2">
              <Link2 className="w-5 h-5 text-[#1f6feb]" /> Nộp bài tập
            </h2>
            
            {timeLeft.isExpired ? (
              <div className="text-center py-6 bg-[#21262d] rounded-lg border border-[#30363d]">
                <AlertCircle className="w-8 h-8 text-[#8b949e] mx-auto mb-3 opacity-50" />
                <p className="text-[#8b949e] text-sm">Việc nộp bài đã được khóa.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <input 
                  type="url" 
                  value={submissionLink}
                  onChange={(e) => setSubmissionLink(e.target.value)}
                  placeholder="Dán link bài làm (VD: GitHub, deployment link)"
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg py-2.5 px-4 text-white placeholder-[#484f58] focus:border-[#1f6feb] focus:ring-1 focus:ring-[#1f6feb]"
                />
                <button 
                  className="w-full bg-[#238636] hover:bg-[#2ea043] text-white py-2.5 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  disabled={!submissionLink || timeLeft.isExpired}
                >
                  Nộp bài ngay
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
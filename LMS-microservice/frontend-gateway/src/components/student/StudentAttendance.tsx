import React from 'react';
import { UserCheck, XCircle, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

export default function StudentAttendance() {
  // Dữ liệu giả lập
  const attendanceData = [
    { course: 'IT001 - Nhập môn Lập trình', total: 15, present: 14, absent: 1, late: 0, status: 'good' },
    { course: 'IT002 - Cấu trúc Dữ liệu', total: 15, present: 10, absent: 4, late: 1, status: 'warning' },
    { course: 'IT003 - Trí tuệ Nhân tạo', total: 15, present: 15, absent: 0, late: 0, status: 'excellent' },
  ];

  return (
    <div className="animate-in fade-in duration-300">
      <h1 className="text-2xl font-bold text-white mb-6 border-b border-[#30363d] pb-4 flex items-center gap-2">
        <UserCheck className="w-6 h-6 text-[#238636]" /> Điểm danh học kỳ hiện tại
      </h1>

      {/* Thống kê tổng quan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-[#8b949e] text-sm font-medium">Tổng số buổi có mặt</p>
            <p className="text-3xl font-bold text-[#c9d1d9] mt-1">39</p>
          </div>
          <div className="p-3 bg-green-500/10 rounded-full"><UserCheck className="w-6 h-6 text-green-500" /></div>
        </div>
        
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-[#8b949e] text-sm font-medium">Tổng số buổi vắng</p>
            <p className="text-3xl font-bold text-red-400 mt-1">5</p>
          </div>
          <div className="p-3 bg-red-500/10 rounded-full"><XCircle className="w-6 h-6 text-red-500" /></div>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex items-center justify-between">
          <div>
            <p className="text-[#8b949e] text-sm font-medium">Tổng số buổi trễ</p>
            <p className="text-3xl font-bold text-yellow-400 mt-1">1</p>
          </div>
          <div className="p-3 bg-yellow-500/10 rounded-full"><Clock className="w-6 h-6 text-yellow-500" /></div>
        </div>
      </div>

      {/* Bảng chi tiết điểm danh từng môn */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#c9d1d9]">
            <thead className="bg-[#21262d] text-[#8b949e] uppercase text-xs">
              <tr>
                <th className="px-6 py-4 font-medium">Môn học</th>
                <th className="px-6 py-4 font-medium text-center">Tổng số buổi</th>
                <th className="px-6 py-4 font-medium text-center text-green-400">Có mặt</th>
                <th className="px-6 py-4 font-medium text-center text-red-400">Vắng mặt</th>
                <th className="px-6 py-4 font-medium text-center text-yellow-400">Đi trễ</th>
                <th className="px-6 py-4 font-medium text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]">
              {attendanceData.map((row, index) => (
                <tr key={index} className="hover:bg-[#21262d]/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{row.course}</td>
                  <td className="px-6 py-4 text-center">{row.total}</td>
                  <td className="px-6 py-4 text-center">{row.present}</td>
                  <td className="px-6 py-4 text-center">{row.absent}</td>
                  <td className="px-6 py-4 text-center">{row.late}</td>
                  <td className="px-6 py-4 text-center">
                    {row.status === 'warning' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                        <AlertTriangle className="w-3.5 h-3.5" /> Nguy cơ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-green-500/10 text-green-400 border border-green-500/20">
                        <CheckCircle className="w-3.5 h-3.5" /> An toàn
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
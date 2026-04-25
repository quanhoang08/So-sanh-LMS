import React, { useState } from 'react';

// Giả lập Dữ liệu Thống kê
const MOCK_KPIS = {
  totalStudents: 1245,
  averageScore: 7.8,
  completionRate: 85, // 85%
  totalCourses: 12,
};

// Phân bố điểm số (Giả lập để vẽ biểu đồ)
const SCORE_DISTRIBUTION = [
  { range: '0 - 4 (Yếu)', percentage: 5, color: 'bg-red-500' },
  { range: '4 - 6 (TB)', percentage: 15, color: 'bg-yellow-500' },
  { range: '6 - 8 (Khá)', percentage: 45, color: 'bg-blue-500' },
  { range: '8 - 10 (Giỏi)', percentage: 35, color: 'bg-green-500' },
];

// Top Khóa học tiêu biểu
const TOP_COURSES = [
  { id: 'c1', name: 'Phát triển Web với React', students: 450, avgScore: 8.2, progress: 90 },
  { id: 'c2', name: 'Cơ sở dữ liệu PostgreSQL', students: 320, avgScore: 7.5, progress: 75 },
  { id: 'c3', name: 'Kiến trúc Microservices', students: 150, avgScore: 6.8, progress: 60 },
];

const LearningReports = () => {
  const [timeFilter, setTimeFilter] = useState('this_semester');

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      {/* Header & Filter */}
      <div className="mb-8 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold">Báo cáo & Thống kê học tập</h1>
          <p className="text-gray-400 text-sm mt-1">Theo dõi tiến độ và chất lượng đào tạo của các khóa học</p>
        </div>
        <select 
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
        >
          <option value="this_month">Tháng này</option>
          <option value="this_semester">Học kỳ này</option>
          <option value="this_year">Năm học này</option>
          <option value="all_time">Tất cả thời gian</option>
        </select>
      </div>

      {/* 1. Thẻ KPI Tổng quan (Overview Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">Tổng Sinh Viên</p>
          <h3 className="text-3xl font-bold text-white">{MOCK_KPIS.totalStudents.toLocaleString()}</h3>
          <p className="text-green-400 text-xs mt-2">↑ 12% so với kỳ trước</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">Điểm Trung Bình</p>
          <h3 className="text-3xl font-bold text-indigo-400">{MOCK_KPIS.averageScore} / 10</h3>
          <p className="text-green-400 text-xs mt-2">↑ 0.4 điểm</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">Tỉ Lệ Hoàn Thành</p>
          <h3 className="text-3xl font-bold text-green-400">{MOCK_KPIS.completionRate}%</h3>
          <p className="text-gray-500 text-xs mt-2">Đạt chỉ tiêu đề ra</p>
        </div>
        <div className="bg-gray-800 p-5 rounded-xl border border-gray-700 shadow-sm">
          <p className="text-gray-400 text-sm font-medium mb-1">Khóa Học Đang Mở</p>
          <h3 className="text-3xl font-bold text-yellow-400">{MOCK_KPIS.totalCourses}</h3>
          <p className="text-gray-500 text-xs mt-2">Đang hoạt động</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 2. Biểu đồ Phân bố điểm (Tailwind CSS Bar Chart) */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold mb-6">Phân bố Điểm số</h3>
          <div className="space-y-5">
            {SCORE_DISTRIBUTION.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{item.range}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
                {/* Thanh Bar Background */}
                <div className="w-full bg-gray-900 rounded-full h-3 border border-gray-700 overflow-hidden">
                  {/* Thanh Bar Foreground (Màu sắc) */}
                  <div 
                    className={`h-3 rounded-full ${item.color} transition-all duration-1000 ease-out`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Bảng Xếp hạng Khóa học */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-lg font-bold mb-6">Tiến độ Khóa học nổi bật</h3>
          <div className="space-y-6">
            {TOP_COURSES.map(course => (
              <div key={course.id} className="border-b border-gray-700 pb-4 last:border-0 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-medium text-indigo-300">{course.name}</h4>
                    <p className="text-xs text-gray-400 mt-1">{course.students} học viên • Điểm TB: {course.avgScore}</p>
                  </div>
                  <span className="text-sm font-bold bg-gray-900 px-2 py-1 rounded border border-gray-700">
                    {course.progress}%
                  </span>
                </div>
                {/* Progress Bar nhỏ */}
                <div className="w-full bg-gray-900 rounded-full h-1.5 mt-2">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningReports;
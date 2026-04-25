import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import StaffSidebar from '../components/staff/StaffSidebar';
import StaffTopBar from '../components/staff/StaffTopBar';
import ClassManagement from '../components/staff/ClassManagement';
import { GradingManagement } from '../components/staff/GradingManagement';
import { QuestionBankManagement } from '../components/staff/QuestionBankManagement';
import LearningReports from '../components/staff/LearningReports';
import ClassDetail from '../components/staff/ClassDetail';

// Component mặc định khi vào trang chủ Giảng viên
const StaffDashboardHome = () => (
  <div className="animate-in fade-in duration-300">
    <div className="flex items-center gap-2 text-xl text-white mb-6 border-b border-[#30363d] pb-4">
      <LayoutDashboard className="w-6 h-6 text-[#238636]" />
      <h1 className="font-semibold">Tổng quan Giảng dạy - HK2 2526</h1>
    </div>
    
    {/* Các thẻ thống kê nhanh cho Giảng viên */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <h3 className="text-[#8b949e] text-sm font-medium mb-1">Lớp học đang phụ trách</h3>
        <p className="text-3xl font-bold text-white">4</p>
      </div>
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <h3 className="text-[#8b949e] text-sm font-medium mb-1">Bài tập cần chấm</h3>
        <p className="text-3xl font-bold text-orange-400">128</p>
      </div>
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <h3 className="text-[#8b949e] text-sm font-medium mb-1">Tin nhắn chưa đọc</h3>
        <p className="text-3xl font-bold text-blue-400">5</p>
      </div>
    </div>
  </div>
);

export default function StaffLayout({ user }: { user: any }) {
  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden font-sans">
      
      <StaffTopBar user={user} />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block">
          <StaffSidebar />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            <Routes>
              <Route path="/" element={<StaffDashboardHome />} />
              <Route path="classes" element={<ClassManagement/>} />
              <Route path="classes/:id" element={<ClassDetail/>} />
              <Route path="grading" element={<GradingManagement/>} />
              <Route path="question-bank" element={<QuestionBankManagement/>} />
              <Route path="reports" element={<LearningReports/>} />
            </Routes>
          </div>
        </main>
      </div>

      <footer className="h-8 border-t border-[#30363d] bg-[#161b22] flex items-center justify-between px-6 text-xs text-[#8b949e]">
        <span>Copyright © 2026 TDTU. All rights reserved.</span>
        <span>Portal Giảng Viên v2.1</span>
      </footer>
    </div>
  );
}
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Users, FileCheck2, Database, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function StaffSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  // Đề xuất các chức năng cốt lõi cho Giảng viên
  const menuItems = [
    { path: '/staff', label: 'Hồ sơ cá nhân', icon: <User className="w-5 h-5" /> },
    { path: '/staff/classes', label: 'Quản lý lớp học', icon: <Users className="w-5 h-5" /> },
    { path: '/staff/grading', label: 'Chấm điểm & Đánh giá', icon: <FileCheck2 className="w-5 h-5" /> },
    { path: '/staff/question-bank', label: 'Ngân hàng câu hỏi', icon: <Database className="w-5 h-5" /> },
    { path: '/staff/reports', label: 'Thống kê báo cáo', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-64 bg-[#161b22] border-r border-[#30363d] flex flex-col h-full">
      <div className="p-4 flex-1">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${isActive
                      ? 'bg-[#238636] text-white font-medium' // Dùng màu xanh lá (như nút Login) để phân biệt với Sinh viên (màu xanh dương)
                      : 'text-[#8b949e] hover:bg-[#21262d] hover:text-[#c9d1d9]'
                    }`}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="p-4 border-t border-[#30363d]">
        <button
          onClick={logout}
          className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-[#2d1a1a] rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
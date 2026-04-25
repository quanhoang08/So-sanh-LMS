import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, ClipboardList, BookOpen, UserCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function StudentSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();      // Việc 1: Dọn sạch Token và State (Thu hồi thẻ)
    navigate('/'); // Việc 2: Chuyển hướng về trang chủ (Đá văng ra khỏi trường)
  };

  const menuItems = [
    { path: '/student', label: 'Hồ sơ cá nhân', icon: <User className="w-5 h-5" /> },
    { path: '/student/assignments', label: 'Bài tập của tôi', icon: <ClipboardList className="w-5 h-5" /> }, // THÊM DÒNG NÀY
    { path: '/student/courses', label: 'Khóa học', icon: <BookOpen className="w-5 h-5" /> }, // Đổi thành /courses
    { path: '/student/attendance', label: 'Điểm danh', icon: <UserCheck className="w-5 h-5" /> },
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
                    ? 'bg-[#1f6feb] text-white font-medium' // Active state
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
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-red-400 hover:bg-[#2d1a1a] rounded-md transition-colors"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
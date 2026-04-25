import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, Users, GraduationCap, ClipboardList, LogOut } from 'lucide-react'; // Cài lucide-react nếu chưa: npm i lucide-react
import { menuItems } from './MenuItem';
export default function Sidebar() {
  const { logout, user } = useAuth();
  const location = useLocation();

  // 🚀 CỐT LÕI NẰM Ở ĐÂY: Lọc menu dựa trên Role của User hiện tại
  const authorizedMenu = menuItems.filter(item => {
    // Nếu user chưa load xong hoặc không có role, không hiện gì cả
    if (!user || !user.role) return false;

    // Kiểm tra xem role của user có nằm trong mảng roles của item không
    return item.roles.includes(user.role);
  });

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-[#161b22] text-[#c9d1d9] border-r border-[#30363d] flex flex-col">
      {/* Logo Section */}
      <div className="p-6 border-b border-[#30363d]">
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white text-xs">LMS</div>
          Admin Center
        </h1>
        <p className="text-[#8b949e] text-xs mt-1 font-mono uppercase tracking-tighter">
          Microservices System
        </p>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        {authorizedMenu.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-2.5 rounded-md text-sm transition-all duration-200 group ${isActive
                  ? 'bg-[#0d1117] text-white border border-[#8b949e]/30 shadow-sm'
                  : 'text-[#c9d1d9] hover:bg-[#21262d] hover:text-white'
                }`}
            >
              <item.icon className={`w-4 h-4 mr-3 ${isActive ? 'text-blue-400' : 'text-[#8b949e] group-hover:text-blue-400'}`} />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-[#30363d] bg-[#0d1117]/50">
        <div className="mb-4 px-2">
          <p className="text-sm font-semibold text-white truncate">{user?.email}</p>
          <div className="flex items-center mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span>
            <span className="text-xs text-[#8b949e] font-medium uppercase tracking-wider">
              {user?.role} Mode
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-white hover:bg-[#da3633]/10 hover:border-[#f85149]/40 border border-transparent rounded-md transition-all"
        >
          <LogOut className="w-4 h-4 mr-3" />
          Đăng xuất
        </button>
      </div>
    </aside>
  );
}
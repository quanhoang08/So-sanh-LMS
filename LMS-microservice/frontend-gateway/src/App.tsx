import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLoginPage from './features/auth/pages/AdminLoginPage';
import DashboardPage from './pages/DashboardPage';
import RoleSelectionPage from './pages/RoleSelectionPage';
import ProtectedRoute from './routes/ProtectedRoute';
import UsersManagementPage from './pages/UsersManagementPage';
import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import StudentLayout from './pages/StudentLayout';
import StaffLayout from './pages/StaffLayout';
import SystemSettings from './pages/SystemSettings';
import PublicRoute from './routes/PublicRoute';
import AccountLockedPage from './pages/AccountLockedPage';
import GuestHomepage from './pages/GuestHomepage';

function App() {
  const [user, setUser] = useState<any>({
    id: '1',
    fullName: 'Nguyễn Văn A',
    email: 'student@tdtu.edu.vn',
    role: 'STUDENT',
    avatar: 'https://github.com/identicons/jasonlong.png'
  });

  return (
    <Router>
      <Routes>
        {/* ======================================================== */}
        {/* 🟢 NHÓM PUBLIC (Không cần đăng nhập)                       */}
        {/* ======================================================== */}
        <Route element={<PublicRoute />}>
          {/* 👇 Đã thay đổi: Trang chủ mặc định là dành cho Guest */}
          <Route path="/" element={<GuestHomepage />} />

          {/* 👇 Đã thay đổi: Trang chọn Role được dời sang /login */}
          <Route path="/login" element={<RoleSelectionPage />} />

          <Route path="/login/:roleType" element={<LoginPage />} />
          <Route path="/admin" element={<AdminLoginPage />} />
          <Route path="/account-locked" element={<AccountLockedPage />} />
        </Route>

        {/* ======================================================== */}
        {/* 🔴 NHÓM PROTECTED (BẮT BUỘC PHẢI CÓ TOKEN)                 */}
        {/* ======================================================== */}

        {/* 1. Khu vực Sinh Viên */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student/*" element={<StudentLayout user={user} />} />
          
        </Route>

        {/* 2. Khu vực Giảng Viên / Nhân viên */}
        <Route element={<ProtectedRoute allowedRoles={['LECTURER', 'STAFF']} />}>
          <Route path="/staff/*" element={<StaffLayout user={user} />} />
        </Route>

        {/* 3. Khu vực Admin */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/dashboard" element={<DashboardPage />} />
          <Route path="/admin/users" element={<UsersManagementPage />} />
          <Route path="/admin/settings" element={<SystemSettings />} />
        </Route>

        {/* ======================================================== */}
        {/* 🟡 FALLBACK (404 Not Found)                                */}
        {/* ======================================================== */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#0d1117] text-[#8b949e]">
              <h1 className="text-5xl font-bold text-white mb-4">404</h1>
              <p className="text-xl">Trang bạn tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}
export default App;
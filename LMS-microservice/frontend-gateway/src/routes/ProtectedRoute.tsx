import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
  children?: React.ReactNode;
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  // 👇 THÊM ĐOẠN NÀY VÀO ĐỂ BẮT BỆNH 👇
  console.log("=== TRẠM KIỂM SOÁT BÁO CÁO ===");
  console.log("1. Đang tải (isLoading):", isLoading);
  console.log("2. Đã đăng nhập (isAuthenticated):", isAuthenticated);
  console.log("3. Thông tin User:", user);
  console.log("4. Quyền yêu cầu (allowedRoles):", allowedRoles);
  console.log("===============================");
  // 1. Đang tải dữ liệu -> Hiện Loading
  if (isLoading) {
    return (
      <div className="h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // 2. Chưa xác thực (Không có token/Token hết hạn) -> Đuổi về Portal (/)
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // 3. 🛡️ KIỂM TRA QUYỀN HẠN NGHIÊM NGẶT
  if (allowedRoles) {
    // Vá lỗ hổng: Bắt buộc phải có thông tin user, có role, VÀ role đó phải nằm trong danh sách cho phép
    if (!user || !user.role || !allowedRoles.includes(user.role)) {
      // Bất cứ điều kiện nào sai -> Lập tức đá văng về trang chủ
      return <Navigate to="/" replace />;
    }
  }

  // 4. Qua được mọi trạm kiểm soát -> Mở cổng
  return children ? <>{children}</> : <Outlet />;
}
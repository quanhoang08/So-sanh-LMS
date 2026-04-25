// src/routes/PublicRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function PublicRoute({ children }: { children?: React.ReactNode }) {
  const { isAuthenticated, user } = useAuth();

  // NẾU ĐÃ ĐĂNG NHẬP RỒI -> Đá văng khỏi trang Login, đưa thẳng vào Dashboard
  if (isAuthenticated && user) {
    if (user.role === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'STUDENT') return <Navigate to="/student/" replace />;
    if (user.role === 'LECTURER') return <Navigate to="/staff/" replace />;
  }

  // Nếu chưa đăng nhập -> Cho phép xem form Login
  return children ? <>{children}</> : <Outlet />;
}
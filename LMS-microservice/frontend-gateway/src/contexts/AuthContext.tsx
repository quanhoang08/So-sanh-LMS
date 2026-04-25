import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';
import type { AuthContextType, User } from '../features/auth/types/auth.types';
import axiosClient from '../api/axios-client';
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  // 🌟 1. THÊM BIẾN STATE LOADING Ở ĐÂY
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 🌟 2. ĐỊNH NGHĨA HÀM KHỞI TẠO
    const initializeAuth = () => {
      try {
        const token = localStorage.getItem('access_token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Lỗi khi đọc dữ liệu từ LocalStorage", error);
        localStorage.clear();
      } finally {
        // 🌟 3. DÙNG setIsLarge (Tên hàm đúng của state isLoading)
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string, roleType: 'ADMIN' | 'STUDENT' | 'LECTURER') => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

      // 🎯 Tự động chọn Endpoint dựa trên loại người dùng
      const endpoint = roleType === 'ADMIN'
        ? `${API_URL}/api/v1/admin/login`
        : `${API_URL}/api/v1/users/login`;

      const response = await axiosClient.post(endpoint,
        {
          email,
          password,
          role: roleType
        });

      // Giả sử backend trả về data nằm trong response.data.data
      const { access_token, user: loggedUser } = response.data.data;

      // 🛡️ Kiểm tra chéo lần cuối cho chắc chắn
      if (roleType === 'ADMIN' && loggedUser.role !== 'ADMIN') {
        throw new Error('Tài khoản này không có quyền quản trị.');
      }

      // 🚧 Thêm chốt chặn cho cổng Sinh viên
      if (roleType === 'STUDENT' && loggedUser.role !== 'STUDENT') {
        throw new Error('email bạn vừa nhập chỉ dùng cho Giảng viên.');
      }

      // 🚧 Thêm chốt chặn cho cổng Giảng viên (Staff)
      // Giả sử cổng này cho phép cả LECTURER và STAFF
      if (roleType === 'LECTURER' && !['LECTURER', 'STAFF'].includes(loggedUser.role)) {
        throw new Error('email này không có quyền truy cập cổng Giảng viên.');
      }
      // Lưu dữ liệu dùng chung
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('user', JSON.stringify(loggedUser));

      setUser(loggedUser);
      setIsAuthenticated(true);

      return loggedUser; // Trả về để Page có thể redirect
    } catch (error: any) {
      // 👇 IN RA CONSOLE TOÀN BỘ CỤC LỖI TỪ BACKEND ĐỂ DỄ ĐỌC
      console.error("LỖI TỪ BACKEND TRẢ VỀ:", error.response?.data);

      // 👇 Xử lý để không bị biến thành [object Object]
      let errorMsg = 'Lỗi đăng nhập';

      if (error.response?.data) {
        // Nếu backend trả về một chuỗi string
        if (typeof error.response.data === 'string') {
          errorMsg = error.response.data;
        }
        // Nếu backend trả về một object (JSON)
        else if (typeof error.response.data === 'object') {
          // Lấy field message nếu có, không thì biến toàn bộ cục JSON thành chuỗi
          errorMsg = error.response.data.message || JSON.stringify(error.response.data);
        }
      } else {
        errorMsg = error.message;
      }

      throw new Error(errorMsg);
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/';
  };

  // 1. Thêm hàm updateUser
  const updateUser = (updatedInfo: any) => {
    // Cập nhật State hiện tại (để Topbar đổi tên/ảnh ngay lập tức)
    setUser((prevUser: any) => {
      if (!prevUser) return prevUser;
      const newUser = { ...prevUser, ...updatedInfo };
      
      // Cập nhật luôn vào LocalStorage để F5 không bị mất
      localStorage.setItem('user', JSON.stringify(newUser));
      
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout, isLoading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng trong AuthProvider');
  }
  return context;
}
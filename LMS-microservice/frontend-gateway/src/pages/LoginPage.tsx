import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, User, Mail, ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const { roleType } = useParams();
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ Context ra

  // Giả sử bạn đang có 2 state này gắn vào input form của bạn
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  // State để hiển thị lỗi ra giao diện nếu sai mật khẩu
  const [errorMessage, setErrorMessage] = useState('');

  const isStudent = roleType === 'student';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(''); // Xóa lỗi cũ (nếu có) trước khi thử đăng nhập lại

    try {
      // 🎯 XÁC ĐỊNH CHÍNH XÁC ROLE DỰA VÀO ĐỐI TƯỢNG ĐĂNG NHẬP
      // Nếu không phải Sinh viên thì tạm mặc định là Giảng viên (LECTURER)
      const currentRole = isStudent ? 'STUDENT' : 'LECTURER';

      // Gọi API với đúng Role
      await login(email, password, currentRole);

        if (isStudent) {
        navigate('/student/');
      } else {
        navigate('/staff/');
      }
      
    } catch (error: any) {
      console.error("Đăng nhập thất bại:", error.message);
      setErrorMessage(error.message);
      // 🎯 Kiểm tra thông báo lỗi
      const errorStr = error.message.toLowerCase();
      if (errorStr.includes('bị khóa') || errorStr.includes('vô hiệu hóa')) {
        // Đá sang trang Locked ngay lập tức
        navigate('/account-locked');
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4">
      {/* Nút quay lại Portal */}
      <Link
        to="/"
        className="absolute top-8 left-8 flex items-center text-[#8b949e] hover:text-white transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Quay lại lựa chọn
      </Link>

      {/* Logo */}
      <div className="mb-8 text-center">
        <img src="../../public/logo.png" alt="TDTU Logo" className="h-16 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Đăng nhập {isStudent ? 'Người học' : 'Giảng viên'}
        </h1>
        <p className="text-[#8b949e] mt-2">Sử dụng tài khoản hệ thống của bạn</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* 🔴 HIỂN THỊ THÔNG BÁO LỖI (NẾU CÓ) */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md text-sm text-center">
              {errorMessage}
            </div>
          )}

          {/* Trường nhập Mã số / Email */}
          <div>
            <label className="block text-sm font-medium text-[#c9d1d9] mb-2">
              {isStudent ? 'Mã số sinh viên' : 'Email công vụ / Mã viên chức'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8b949e]">
                {isStudent ? <User className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
              </div>
              <input
                required
                type="text"
                value={email} // 👈 1. Ràng buộc dữ liệu với State
                onChange={(e) => setEmail(e.target.value)} // 👈 2. Cập nhật State khi người dùng gõ
                placeholder={isStudent ? "Ví dụ: 52100..." : "Ví dụ: nguyenvan@tdtu.edu.vn"}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-2.5 pl-10 pr-4 text-white placeholder-[#484f58] focus:border-[#1f6feb] focus:ring-1 focus:ring-[#1f6feb] outline-none transition-all"
              />
            </div>
          </div>

          {/* Trường nhập Mật khẩu */}
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-sm font-medium text-[#c9d1d9]">Mật khẩu</label>
              <a href="#" className="text-sm text-[#58a6ff] hover:underline">Quên mật khẩu?</a>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#8b949e]">
                <Lock className="w-5 h-5" />
              </div>
              <input
                required
                type={showPassword ? "text" : "password"}
                value={password} // 👈 1. Ràng buộc dữ liệu với State
                onChange={(e) => setPassword(e.target.value)} // 👈 2. Cập nhật State khi người dùng gõ
                placeholder="••••••••"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md py-2.5 pl-10 pr-12 text-white placeholder-[#484f58] focus:border-[#1f6feb] focus:ring-1 focus:ring-[#1f6feb] outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#8b949e] hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Nút Đăng nhập */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#238636] hover:bg-[#2ea043] text-white font-semibold py-2.5 rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>

        {/* Chú thích thêm */}
        <div className="mt-8 pt-6 border-t border-[#30363d] text-center">
          <p className="text-sm text-[#8b949e]">
            {isStudent
              ? "Lưu ý: Sinh viên sử dụng tài khoản được cấp khi nhập học."
              : "Lưu ý: Giảng viên sử dụng tài khoản Portal để đăng nhập."}
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-[#8b949e] text-xs">
        &copy; 2026 Ton Duc Thang University. All rights reserved.
      </footer>
    </div>
  );
}
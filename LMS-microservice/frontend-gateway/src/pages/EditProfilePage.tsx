import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X, Info } from 'lucide-react';
import axiosClient from '../api/axios-client';
import { useAuth } from '../contexts/AuthContext';
// import axiosClient from '../../api/axios-client'; // Đừng quên import cái này trong dự án thật

export default function EditProfilePage() {
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const { updateUser } = useAuth();
    
    // Giả sử formData này đã được đổ dữ liệu từ trước (qua API GET profile)
    const [formData, setFormData] = useState({
        fullName: 'Nguyen Van A',
        phone: '0987654321',
        address: '',
        avatarUrl: 'https://example.com/avatar.jpg',
        email:'',
        faculty:'',
        studentId: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        fullname: formData.fullName, 
        phone: formData.phone,
        avatarUrl: formData.avatarUrl
      };

      // 1. Gửi xuống Backend
      await axiosClient.patch('/api/v1/students/profile', payload);

      // 2. 🚀 CẬP NHẬT NÓNG LÊN TOPBAR & LOCAL STORAGE
      // Chú ý truyền đúng key mà AuthContext đang lưu (ví dụ ở đây tôi giả sử auth lưu là fullName và avatarUrl)
      updateUser({
        fullName: payload.fullname, // Backend dùng fullname, nhưng frontend bạn dùng fullName
        avatarUrl: payload.avatarUrl
      });

      // 3. Đá về trang Profile
      navigate('/student/profile');
      
    } catch (error: any) {
      // ... xử lý lỗi
    } finally {
      setIsSubmitting(false);
    }
  };

    return (
        <div className="animate-in fade-in duration-300 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6 border-b border-[#30363d] pb-4">
                Cập nhật hồ sơ cá nhân
            </h1>
            {/* Hiển thị thông báo lỗi nếu API thất bại */}
            {errorMsg && (
                <div className="bg-red-900/20 border border-red-700/50 text-red-500 px-4 py-3 rounded-md mb-6">
                    {errorMsg}
                </div>
            )}

            <div className="bg-blue-900/20 border border-blue-700/50 text-blue-400 px-4 py-3 rounded-md mb-8 flex items-start gap-3">
                <Info className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm">
                    Bạn chỉ có thể cập nhật thông tin liên hệ và ảnh đại diện. Các thông tin học vụ (Tên, MSSV, Khoa) được quản lý bởi Phòng Đại học.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="bg-[#161b22] border border-[#30363d] rounded-xl p-6">

                {/* Nhóm thông tin KHÔNG ĐƯỢC SỬA (Read-only) */}
                <h3 className="text-lg font-semibold text-[#c9d1d9] mb-4 border-b border-[#30363d] pb-2">
                    Thông tin học vụ (Chỉ đọc)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-sm text-[#8b949e] mb-1">Họ và tên</label>
                        <input type="text" value={formData.fullName} disabled
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#8b949e] cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm text-[#8b949e] mb-1">Mã số sinh viên</label>
                        <input type="text" value={formData.studentId} disabled
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#8b949e] cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm text-[#8b949e] mb-1">Email sinh viên</label>
                        <input type="text" value={formData.email} disabled
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#8b949e] cursor-not-allowed" />
                    </div>
                    <div>
                        <label className="block text-sm text-[#8b949e] mb-1">Khoa chủ quản</label>
                        <input type="text" value={formData.faculty} disabled
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-[#8b949e] cursor-not-allowed" />
                    </div>
                </div>

                {/* Nhóm thông tin ĐƯỢC SỬA */}
                <h3 className="text-lg font-semibold text-[#c9d1d9] mb-4 border-b border-[#30363d] pb-2">
                    Thông tin liên hệ
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                    <div>
                        <label className="block text-sm text-[#8b949e] mb-1">Số điện thoại</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff] transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-[#8b949e] mb-1">URL Ảnh đại diện (Tuỳ chọn)</label>
                        <input
                            type="text"
                            name="avatarUrl"
                            placeholder="https://example.com/avatar.jpg"
                            value={formData.avatarUrl}
                            onChange={handleChange}
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff] transition-colors"
                        />
                    </div>
                    <div className="sm:col-span-2">
                        <label className="block text-sm text-[#8b949e] mb-1">Địa chỉ liên hệ</label>
                        <input
                            type="text"
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full bg-[#0d1117] border border-[#30363d] rounded-md px-3 py-2 text-white focus:outline-none focus:border-[#58a6ff] transition-colors"
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-[#30363d]">
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-transparent text-[#c9d1d9] hover:bg-[#30363d] border border-[#30363d] rounded-md font-medium transition-colors flex items-center gap-2"
                    >
                        <X className="w-4 h-4" /> Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save className="w-4 h-4" />
                        {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </form>
        </div>
    );
}
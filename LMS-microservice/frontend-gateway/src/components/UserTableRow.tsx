import React, { useState } from 'react';
import { User, MoreHorizontal, Shield, Ban, Edit2 } from 'lucide-react';
import axiosClient from '../api/axios-client';

interface UserTableRowProps {
  user: any;
  getStatusStyle: (status: string) => string;
  formatDate: (dateString: string) => string;
  onRefresh: () => void;
  isOpen: boolean;
  onToggle: () => void;
  isNearBottom: boolean;
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user, getStatusStyle, formatDate, onRefresh, isOpen, onToggle, isNearBottom
}) => {
  // States quản lý Dropdown & Modal
  // const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isEditRoleModalOpen, setIsEditRoleModalOpen] = useState(false);
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);

  // States lưu trữ dữ liệu sửa đổi
  const [newRole, setNewRole] = useState(user.role);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Hàm Đổi Role (Phân quyền)
  const submitChangeRole = async () => {
    try {
      setIsSubmitting(true);
      // Gọi đúng API: PATCH /api/v1/admin/list_users/:id/role
      await axiosClient.patch(`/api/v1/admin/list_users/${user.id || user._id}/role`, {
        role: newRole,
        status: user.status // Giữ nguyên status hiện tại
      });
      alert("Cập nhật phân quyền thành công!");
      setIsEditRoleModalOpen(false);
      onRefresh();
    } catch (error: any) {
      console.error("Lỗi đổi quyền:", error.response?.data);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi đổi phân quyền!");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. Hàm Vô hiệu hóa / Kích hoạt lại tài khoản
  const submitDisableAccount = async () => {
    try {
      setIsSubmitting(true);
      // Nếu đang ACTIVE thì đổi thành SUSPENDED/INACTIVE và ngược lại
      const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

      // Gọi đúng API: PATCH /api/v1/admin/:id/disable
      await axiosClient.patch(`/api/v1/admin/${user.id || user._id}/disable`, {
        role: user.role, // Giữ nguyên role
        status: newStatus
      });

      alert(`Đã ${newStatus === 'ACTIVE' ? 'mở khóa' : 'khóa'} tài khoản thành công!`);
      setIsDisableModalOpen(false);
      onRefresh();
    } catch (error: any) {
      console.error("Lỗi khóa tài khoản:", error.response?.data);
      alert(error.response?.data?.message || "Đã xảy ra lỗi khi thay đổi trạng thái!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <tr className="hover:bg-[#21262d] transition-colors group">
        {/* ... (Các cột hiển thị thông tin user giữ nguyên) ... */}
        <td className="px-6 py-3 text-white flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#30363d] flex items-center justify-center overflow-hidden">
            <User className="w-4 h-4 text-[#8b949e]" />
          </div>
          <span className="font-medium">{user.email}</span>
        </td>
        <td className="px-6 py-3">
          <span className="text-[#8b949e] font-mono text-xs px-2 py-1 rounded border border-[#30363d] bg-[#0d1117]">
            {user.role}
          </span>
        </td>
        <td className="px-6 py-3">
          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getStatusStyle(user.status || 'ACTIVE')}`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'ACTIVE' ? 'bg-green-400' : user.status === 'INACTIVE' ? 'bg-gray-400' : 'bg-red-400'}`}></span>
            {user.status || 'ACTIVE'}
          </span>
        </td>
        <td className="px-6 py-3 text-[#8b949e]">
          {formatDate(user.createdAt || user.created_at)}
        </td>

        {/* Ô Hành Động */}
        <td className="relative px-6 py-3 text-right">
          <button
            onClick={onToggle} // Dùng hàm onToggle từ cha truyền xuống
            className="!bg-[#161b22] hover:bg-[#30363d] transition-colors group flex items-center justify-center ml-auto"          >
            <MoreHorizontal className="w-4 h-4" />
          </button>


          {/* 2. DROPDOWN MENU (Nền đen #161b22, viền tối) */}
          {/* DROPDOWN MENU */}
          {isOpen && (
            <div
              style={{ backgroundColor: '#161b22' }} // 🔥 VŨ KHÍ 1: ÉP CỨNG NỀN TỐI CHO CONTAINER
              className={`absolute right-8 w-48 rounded-md shadow-2xl z-[999] border border-[#30363d] text-left overflow-hidden 
        ${isNearBottom ? 'bottom-10 mb-2' : 'top-10 mt-2'}
      `}
            >
              <ul className="py-1">
                {/* Nút Phân quyền */}
                <li>
                  <button
                    style={{ backgroundColor: 'transparent' }} // 🔥 VŨ KHÍ 2: XÓA NỀN TRẮNG CỦA THẺ BUTTON GLOBAL
                    onClick={() => { setIsEditRoleModalOpen(true); onToggle(); }}
                    className="flex items-center px-4 py-2 text-sm text-white hover:!bg-[#30363d] w-full text-left transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-2" /> Phân quyền
                  </button>
                </li>

                {/* Nút Khóa / Mở khóa */}
                <li>
                  <button
                    style={{ backgroundColor: 'transparent' }} // 🔥 Tương tự
                    onClick={() => { setIsDisableModalOpen(true); onToggle(); }}
                    className={`flex items-center px-4 py-2 text-sm w-full text-left transition-colors hover:!bg-[#30363d] 
              ${user.status === 'ACTIVE' ? 'text-yellow-500' : 'text-green-500'}
            `}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    {user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  </button>
                </li>

                {/* Nút Chỉnh sửa */}
                <li>
                  <button
                    style={{ backgroundColor: 'transparent' }} // 🔥 Tương tự
                    onClick={() => { alert("Chức năng đang phát triển!"); onToggle(); }}
                    className="flex items-center px-4 py-2 text-sm text-white hover:!bg-[#30363d] w-full text-left transition-colors"
                  >
                    <Edit2 className="w-4 h-4 mr-2" /> Chỉnh sửa
                  </button>
                </li>
              </ul>
            </div>
          )}
        </td>
      </tr>

      {/* ========================================================= */}
      {/* 🚀 MODAL 1: ĐỔI PHÂN QUYỀN */}
      {/* ========================================================= */}
      {isEditRoleModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">

            <div className="px-6 py-4 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Shield className="w-5 h-5 mr-2 text-blue-400" />
                Cập nhật quyền
              </h2>
            </div>

            <div className="p-6">
              <p className="text-sm text-[#8b949e] mb-4">
                Chọn vai trò mới cho <strong className="text-white">{user.email}</strong>
              </p>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="STUDENT">Học viên (Student)</option>
                <option value="LECTURER">Giảng viên (Lecturer)</option>
                <option value="ADMIN">Quản trị viên (Admin)</option>
              </select>
            </div>

            <div className="px-6 py-4 border-t border-[#30363d] bg-[#0d1117] flex justify-end gap-3">
              <button
                onClick={() => setIsEditRoleModalOpen(false)}
                className="px-4 py-2 text-sm  !bg-[#30363d] text-[#c9d1d9] hover:bg-[#30363d] rounded-md border border-[#30363d] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={submitChangeRole}
                disabled={isSubmitting}
                className="px-4 py-2 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 flex items-center transition-colors"
              >
                {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🚀 MODAL 2: XÁC NHẬN KHÓA/MỞ KHÓA */}
      {/* ========================================================= */}
      {isDisableModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">

            <div className="px-6 py-4 border-b border-[#30363d] bg-[#0d1117] flex items-center">
              <Ban className={`w-5 h-5 mr-2 ${user.status === 'ACTIVE' ? 'text-yellow-500' : 'text-green-500'}`} />
              <h2 className={`text-lg font-semibold ${user.status === 'ACTIVE' ? 'text-yellow-500' : 'text-green-500'}`}>
                {user.status === 'ACTIVE' ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}
              </h2>
            </div>

            <div className="p-6">
              <p className="text-sm text-[#c9d1d9]">
                Bạn có chắc chắn muốn {user.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản <strong className="text-white">{user.email}</strong>?
              </p>
              {user.status === 'ACTIVE' && (
                <p className="text-xs text-[#8b949e] mt-2">Người dùng này sẽ không thể đăng nhập vào hệ thống cho đến khi được mở khóa lại.</p>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#30363d] bg-[#0d1117] flex justify-end gap-3">
              <button
                onClick={() => setIsDisableModalOpen(false)}
                className="px-4 py-2 text-sm !bg-[#30363d] text-amber-700 hover:bg-[#30363d] rounded-md border border-[#30363d] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={submitDisableAccount}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm !bg-[#30363d] text-white rounded-md disabled:opacity-50 transition-colors ${user.status === 'ACTIVE' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
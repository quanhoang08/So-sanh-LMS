import React, { useState } from 'react';
import { Ban } from 'lucide-react';

export default function ActionToggleStatus({ user, onToggle, onRefresh }: any) {
  // 1. Quản lý trạng thái đóng/mở Modal và trạng thái Loading API
  const [isDisableModalOpen, setIsDisableModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 2. Hàm gọi API Khóa/Mở khóa
  const submitDisableAccount = async () => {
    setIsSubmitting(true);
    try {
      // Giả sử API của bạn là: PUT /api/v1/admin/change_status
      console.log(`Đang gọi API cho user: ${user.email}`);
      
      // await axios.put(`/api/v1/admin/change_status`, { userId: user.id });

      // Sau khi thành công:
      setIsDisableModalOpen(false);
      if (onRefresh) onRefresh(); // Load lại bảng dữ liệu
    } catch (error) {
      console.error("Lỗi khi đổi trạng thái:", error);
      alert("Không thể cập nhật trạng thái người dùng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Nút bấm trong Dropdown Menu */}
      <li>
        <button
          style={{ backgroundColor: 'transparent' }}
          onClick={() => {
            setIsDisableModalOpen(true); // Mở Modal xác nhận
            onToggle();                  // Đóng Dropdown 3 chấm
          }}
          className={`flex items-center px-4 py-2 text-sm w-full text-left transition-colors hover:!bg-[#30363d] 
            ${user.status === 'ACTIVE' ? 'text-yellow-500' : 'text-green-500'}
          `}
        >
          <Ban className="w-4 h-4 mr-2" />
          {user.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
        </button>
      </li>

      {/* 🚀 KHỐI MODAL XÁC NHẬN (UI của bạn đây) */}
      {isDisableModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 text-left">

            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-[#30363d] bg-[#0d1117] flex items-center">
              <Ban className={`w-5 h-5 mr-2 ${user.status === 'ACTIVE' ? 'text-yellow-500' : 'text-green-500'}`} />
              <h2 className={`text-lg font-semibold ${user.status === 'ACTIVE' ? 'text-yellow-500' : 'text-green-500'}`}>
                {user.status === 'ACTIVE' ? 'Xác nhận khóa' : 'Xác nhận mở khóa'}
              </h2>
            </div>

            {/* Body Modal */}
            <div className="p-6">
              <p className="text-sm text-[#c9d1d9]">
                Bạn có chắc chắn muốn {user.status === 'ACTIVE' ? 'khóa' : 'mở khóa'} tài khoản <strong className="text-white">{user.email}</strong>?
              </p>
              {user.status === 'ACTIVE' && (
                <p className="text-xs text-[#8b949e] mt-2">
                  Người dùng này sẽ không thể đăng nhập vào hệ thống cho đến khi được mở khóa lại.
                </p>
              )}
            </div>

            {/* Footer Modal - Nút bấm */}
            <div className="px-6 py-4 border-t border-[#30363d] bg-[#0d1117] flex justify-end gap-3">
              <button
                onClick={() => setIsDisableModalOpen(false)}
                className="px-4 py-2 text-sm bg-[#30363d] text-white hover:bg-[#3d444d] rounded-md border border-[#30363d] transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={submitDisableAccount}
                disabled={isSubmitting}
                className={`px-4 py-2 text-sm text-white rounded-md disabled:opacity-50 transition-colors font-medium ${
                  user.status === 'ACTIVE' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'
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
}
import React, { useState } from 'react';
import { Trash2, X } from 'lucide-react';

export default function ActionDeleteUser({ user, onToggle, onRefresh }: any) {
  const [isOpen, setIsOpen] = useState(false);

  const handleDelete = async () => {
    // Gọi API: DELETE /api/v1/admin/users/:id
    console.log(`Đang xóa tài khoản ${user.email}...`);
    // Sau khi xóa thành công:
    setIsOpen(false);
    if (onRefresh) onRefresh();
  };

  return (
    <>
      <li>
        <button
          style={{ backgroundColor: 'transparent' }}
          onClick={() => { setIsOpen(true); onToggle(); }}
          className="flex items-center px-4 py-2 text-sm text-red-500 hover:!bg-[#30363d] w-full text-left transition-colors"
        >
          <Trash2 className="w-4 h-4 mr-2" /> Xóa tài khoản
        </button>
      </li>

      {/* MODAL CẢNH BÁO XÓA */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-96 p-6 shadow-2xl">
             <div className="flex justify-between items-center mb-4">
              <h3 className="text-red-500 font-bold text-lg">Cảnh báo nguy hiểm</h3>
              <button onClick={() => setIsOpen(false)} className="text-[#8b949e] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-[#c9d1d9] mb-6">
              Bạn có chắc chắn muốn xóa user <span className="text-white font-bold">{user.email}</span> không? Hành động này không thể hoàn tác!
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-transparent text-white border border-[#30363d] rounded-md hover:bg-[#30363d]">Hủy</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium">Có, xóa ngay</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
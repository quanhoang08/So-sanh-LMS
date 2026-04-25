import React, { useState } from 'react';
import { Shield, X } from 'lucide-react';

export default function ActionChangeRole({ user, onToggle, onRefresh }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const [newRole, setNewRole] = useState(user.role);

  const handleSubmit = async () => {
    // Gọi API: PUT /api/v1/admin/change_role
    console.log(`Đang đổi quyền cho ${user.email} thành ${newRole}`);
    // Sau khi gọi API thành công:
    setIsOpen(false);
    if (onRefresh) onRefresh();
  };

  return (
    <>
      <li>
        <button
          style={{ backgroundColor: 'transparent' }}
          onClick={() => { setIsOpen(true); onToggle(); }}
          className="flex items-center px-4 py-2 text-sm text-white hover:!bg-[#30363d] w-full text-left transition-colors"
        >
          <Shield className="w-4 h-4 mr-2" /> Phân quyền
        </button>
      </li>

      {/* MODAL PHÂN QUYỀN */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg w-96 p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Phân quyền tài khoản</h3>
              <button onClick={() => setIsOpen(false)} className="text-[#8b949e] hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <select 
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="w-full bg-[#0d1117] text-white border border-[#30363d] rounded-md p-2 mb-4"
            >
              <option value="ADMIN">Quản trị viên (Admin)</option>
              <option value="LECTURER">Giảng viên (Lecturer)</option>
              <option value="STUDENT">Học viên (Student)</option>
            </select>
            <div className="flex justify-end gap-2">
              <button onClick={() => setIsOpen(false)} className="px-4 py-2 bg-transparent text-white border border-[#30363d] rounded-md hover:bg-[#30363d]">Hủy</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Lưu thay đổi</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react'; // Nhớ import icon

interface PaginationProps {
  totalItems: number;           // Tổng số bản ghi (ví dụ: filteredUsers.length)
  currentPage: number;          // Trang hiện tại
  totalPages: number;           // Tổng số trang
  onPageChange: (page: number) => void; // Hàm gọi ngược lại cha khi bấm Next/Prev
  itemName?: string;            // Tên của loại dữ liệu (VD: "người dùng", "khóa học")
}

export const Pagination: React.FC<PaginationProps> = ({
  totalItems,
  currentPage,
  totalPages,
  onPageChange,
  itemName = "bản ghi", // Mặc định là "bản ghi" nếu không truyền vào
}) => {
  return (
    <div className="p-4 border-t border-[#30363d] flex items-center justify-between text-sm text-[#8b949e]">
      <div>
        Có tổng cộng <span className="text-white font-medium">{totalItems}</span> {itemName}
      </div>

      <div className="flex items-center gap-4">
        {/* Báo số trang */}
        <span>Trang <span className="text-white font-medium">{currentPage}</span> / {totalPages || 1}</span>

        {/* Hai nút Tới/Lùi */}
        <div className="flex space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="px-3 py-1.5 rounded-md border !bg-[#30363d] !text-white  border-[#30363d] hover:bg-[#30363d] hover:text-white transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed bg-[#21262d]"
          >
            <ChevronLeft className="w-4 h-4 mr-1" /> Trước
          </button>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="px-3 py-1.5 rounded-md border !bg-[#30363d] !text-white border-[#30363d] hover:bg-[#30363d] hover:text-white transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed bg-[#21262d]"
          >
            Sau <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
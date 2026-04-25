import React from 'react';

interface TableSkeletonProps {
  rows?: number; // Cho phép truyền số hàng muốn hiển thị (mặc định là 5)
}

export const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, idx) => (
        <tr key={idx} className="animate-pulse">
          <td className="px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#30363d]"></div>
            <div className="h-4 bg-[#30363d] rounded w-32"></div>
          </td>
          <td className="px-6 py-4"><div className="h-5 bg-[#30363d] rounded w-20"></div></td>
          <td className="px-6 py-4"><div className="h-5 bg-[#30363d] rounded w-16"></div></td>
          <td className="px-6 py-4"><div className="h-4 bg-[#30363d] rounded w-24"></div></td>
          <td className="px-6 py-4 flex justify-end"><div className="h-6 w-6 bg-[#30363d] rounded"></div></td>
        </tr>
      ))}
    </>
  );
};
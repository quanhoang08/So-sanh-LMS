import React from 'react';

interface EmptyStateProps {
  colSpan: number;
  message: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ colSpan, message }) => {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-[#8b949e]">
        {message}
      </td>
    </tr>
  );
};
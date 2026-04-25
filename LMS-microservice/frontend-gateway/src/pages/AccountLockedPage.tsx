import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react'; // Icon cái khiên cảnh báo (nếu bạn dùng lucide-react)

export default function AccountLockedPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d1117] px-4">
      <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-xl p-8 text-center shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-500/10 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-500" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-white mb-2">Tài khoản đã bị khóa</h2>
        <p className="text-[#8b949e] mb-6">
          Rất tiếc, tài khoản của bạn hiện đang bị vô hiệu hóa hoặc tạm khóa. Bạn không thể truy cập vào hệ thống lúc này.
        </p>

        <div className="bg-[#0d1117] border border-[#30363d] rounded-lg p-4 mb-6 text-sm text-left text-[#8b949e]">
          <p className="font-semibold text-gray-300 mb-1">Cách khắc phục:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Đối với Sinh viên: Liên hệ Phòng Công tác Sinh viên.</li>
            <li>Đối với Giảng viên/Nhân viên: Liên hệ Phòng Nhân sự hoặc IT Helpdesk.</li>
            <li>Hotline hỗ trợ: 1900 xxxx</li>
          </ul>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full py-2.5 px-4 bg-[#238636] hover:bg-[#2ea043] text-white rounded-md font-medium transition-colors"
        >
          Quay lại trang chủ
        </button>
      </div>
    </div>
  );
}
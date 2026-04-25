import React, { useState } from 'react';

// Giả lập dữ liệu cài đặt ban đầu (Sau này sẽ fetch từ API)
const INITIAL_SETTINGS = {
  siteName: 'LMS Center',
  maintenanceMode: false,
  allowRegistration: true,
  maxUploadSize: 50, // MB
  smtpHost: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUser: 'admin@lms.com',
  sessionTimeout: 120, // Phút
};

const SystemSettings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState(INITIAL_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);

  // Xử lý thay đổi dữ liệu (cả input text lẫn toggle/checkbox)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Hàm gọi API lưu cài đặt
  const handleSave = async () => {
    setIsSaving(true);
    // Giả lập gọi API
    setTimeout(() => {
      console.log('Đã lưu cấu hình lên backend:', settings);
      alert('Đã lưu cài đặt hệ thống thành công!');
      setIsSaving(false);
    }, 1000);
  };

  // UI Nút Toggle (Bật/Tắt) viết bằng Tailwind thuần
  const ToggleSwitch = ({ name, checked, label, description }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-800 last:border-0">
      <div className="flex flex-col">
        <span className="text-sm font-medium text-gray-200">{label}</span>
        <span className="text-xs text-gray-500">{description}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" name={name} checked={checked} onChange={handleChange} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    </div>
  );

  return (
    <div className="p-8 text-white min-h-screen bg-[#0f172a] rounded-tl-2xl">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Cài đặt hệ thống</h1>
          <p className="text-gray-400 text-sm mt-2">Quản lý cấu hình toàn cục của hệ thống Microservices LMS</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      <div className="flex gap-8">
        {/* Sidebar Tabs */}
        <div className="w-1/4">
          <div className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-800">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full text-left px-5 py-4 text-sm font-medium transition-colors ${activeTab === 'general' ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              ⚙️ Cài đặt chung
            </button>
            <button 
              onClick={() => setActiveTab('security')}
              className={`w-full text-left px-5 py-4 text-sm font-medium transition-colors ${activeTab === 'security' ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              🛡️ Bảo mật & Truy cập
            </button>
            <button 
              onClick={() => setActiveTab('email')}
              className={`w-full text-left px-5 py-4 text-sm font-medium transition-colors ${activeTab === 'email' ? 'bg-blue-600/10 text-blue-400 border-l-2 border-blue-500' : 'text-gray-400 hover:bg-gray-800'}`}
            >
              📧 Cấu hình SMTP (Email)
            </button>
          </div>
        </div>

        {/* Nội dung Tab */}
        <div className="w-3/4 bg-[#1e293b] rounded-xl border border-gray-800 p-8 shadow-sm">
          
          {/* TAB 1: CÀI ĐẶT CHUNG */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-gray-800 pb-4 mb-6">Cài đặt chung</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Tên Website / Hệ thống</label>
                <input 
                  type="text" name="siteName" value={settings.siteName} onChange={handleChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Giới hạn dung lượng upload file (MB)</label>
                <input 
                  type="number" name="maxUploadSize" value={settings.maxUploadSize} onChange={handleChange}
                  className="w-full md:w-1/2 bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-2">Áp dụng cho báo cáo của sinh viên và tài liệu của giảng viên.</p>
              </div>

              <div className="pt-4 mt-6">
                <h3 className="text-md font-medium text-gray-300 mb-4">Trạng thái hệ thống</h3>
                <ToggleSwitch 
                  name="maintenanceMode" checked={settings.maintenanceMode} 
                  label="Chế độ bảo trì (Maintenance Mode)" 
                  description="Bật tính năng này sẽ chặn tất cả sinh viên và giảng viên đăng nhập, chỉ Admin có thể truy cập."
                />
              </div>
            </div>
          )}

          {/* TAB 2: BẢO MẬT */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-gray-800 pb-4 mb-6">Bảo mật & Truy cập</h2>
              
              <ToggleSwitch 
                name="allowRegistration" checked={settings.allowRegistration} 
                label="Cho phép tự do đăng ký tài khoản" 
                description="Nếu tắt, sinh viên mới chỉ có thể được thêm thủ công bởi Admin."
              />

              <div className="mt-6 pt-4 border-t border-gray-800">
                <label className="block text-sm font-medium text-gray-400 mb-2">Thời gian hết hạn phiên đăng nhập (Phút)</label>
                <input 
                  type="number" name="sessionTimeout" value={settings.sessionTimeout} onChange={handleChange}
                  className="w-full md:w-1/2 bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* TAB 3: EMAIL */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold border-b border-gray-800 pb-4 mb-6">Cấu hình Gửi Mail (SMTP)</h2>
              <p className="text-sm text-gray-400 mb-6">Hệ thống sử dụng cấu hình này để gửi email xác thực, cấp lại mật khẩu và thông báo lớp học.</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">SMTP Host</label>
                  <input 
                    type="text" name="smtpHost" value={settings.smtpHost} onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">SMTP Port</label>
                  <input 
                    type="number" name="smtpPort" value={settings.smtpPort} onChange={handleChange}
                    className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Email tài khoản (SMTP Username)</label>
                <input 
                  type="text" name="smtpUser" value={settings.smtpUser} onChange={handleChange}
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mật khẩu ứng dụng (App Password)</label>
                <input 
                  type="password" placeholder="••••••••••••"
                  className="w-full bg-[#0f172a] border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
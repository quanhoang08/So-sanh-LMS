import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Calendar, Globe, Phone, Eye } from 'lucide-react';

export default function GuestHomepage() {
  const navigate = useNavigate();
  
  // 🌟 Thêm state để quản lý tab đang chọn (mặc định là 'home')
  const [activeTab, setActiveTab] = useState<'home' | 'calendar'>('home');

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#c9d1d9] font-sans overflow-hidden">
      
      {/* ========================================== */}
      {/* TOP BAR */}
      {/* ========================================== */}
      <header className="h-14 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between px-4 lg:px-6 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <div className="font-bold text-lg tracking-wider text-white">
            <span className="text-[#58a6ff]">TDTU</span> LMS
          </div>
        </div>

        <div className="text-sm text-[#8b949e] flex items-center gap-2">
          <span className="hidden md:inline">Người dùng khách - guest</span>
          <Globe className="w-4 h-4 mx-1" />
          <span className="hidden lg:inline border-l border-[#30363d] pl-3 ml-1">
            Bạn đang truy cập với tư cách khách vãng lai
          </span>
          <span className="ml-1">
            (
            <Link to="/login" className="text-[#58a6ff] hover:text-[#79c0ff] hover:underline transition-colors font-medium">
              Đăng nhập
            </Link>
            )
          </span>
        </div>
      </header>

      {/* ========================================== */}
      {/* MAIN LAYOUT */}
      {/* ========================================== */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* SIDEBAR */}
        <aside className="w-64 border-r border-[#30363d] bg-[#161b22] hidden md:flex flex-col justify-between overflow-y-auto">
          <nav className="p-4 space-y-2">
            {/* 🟢 Nút Trang chủ */}
            <button 
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeTab === 'home' 
                  ? 'bg-[#1f242c] text-white border border-[#30363d]' 
                  : 'text-[#8b949e] hover:bg-[#1f242c] hover:text-white border border-transparent'
              }`}
            >
              <Home className="w-5 h-5" />
              Trang chủ
            </button>

            {/* 🟢 Nút Lịch */}
            <button 
              onClick={() => setActiveTab('calendar')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md font-medium transition-colors ${
                activeTab === 'calendar' 
                  ? 'bg-[#1f242c] text-white border border-[#30363d]' 
                  : 'text-[#8b949e] hover:bg-[#1f242c] hover:text-white border border-transparent'
              }`}
            >
              <Calendar className="w-5 h-5" />
              Lịch
            </button>
          </nav>

          <div className="p-4 border-t border-[#30363d] text-xs text-[#8b949e] space-y-3">
            <a href="https://www.tdtu.edu.vn/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-[#58a6ff] transition-colors">
              <Globe className="w-4 h-4" />
              https://www.tdtu.edu.vn/
            </a>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4" />
              (028) 37 755 035
            </div>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-5xl mx-auto">
            
            {/* ================================================= */}
            {/* 📍 TAB 1: TRANG CHỦ (Chỉ hiện khi activeTab === 'home') */}
            {/* ================================================= */}
            {activeTab === 'home' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                
                {/* Banner & Giới thiệu */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-sm overflow-hidden">
                  <div className="p-8 text-center border-b border-[#30363d] bg-gradient-to-b from-[#1f242c] to-[#161b22]">
                    <h1 className="text-3xl font-bold text-white tracking-wide mb-2">
                      ĐẠI HỌC TÔN ĐỨC THẮNG
                    </h1>
                    <p className="text-lg text-[#8b949e]">Ton Duc Thang University (TDTU)</p>
                  </div>
                  
                  {/* 🌟 Phần giới thiệu thêm vào đây */}
                  <div className="p-6 bg-[#0d1117]/50 text-[#c9d1d9] leading-relaxed">
                    <h3 className="text-lg font-semibold text-white mb-2">Giới thiệu hệ thống E-Learning</h3>
                    <p>
                      Chào mừng quý khách đến với Hệ thống Quản lý học tập (LMS) chính thức của Đại học Tôn Đức Thắng. 
                      Đây là nền tảng trực tuyến hỗ trợ công tác giảng dạy, học tập và chia sẻ tài nguyên cho toàn thể giảng viên và sinh viên nhà trường.
                    </p>
                    <p className="mt-2 text-[#8b949e] text-sm italic">
                      * Với tư cách khách vãng lai, bạn có thể xem các tin tức chung và lịch sự kiện công khai. Vui lòng đăng nhập để truy cập đầy đủ các khóa học và tài nguyên.
                    </p>
                  </div>
                </div>

                {/* Tin tức chung */}
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4 border-b border-[#30363d] pb-4">
                    <h2 className="text-xl font-medium text-white">Tin tức chung</h2>
                    <button className="text-sm text-[#58a6ff] hover:underline self-start sm:self-auto">
                      Đăng ký tới diễn đàn này
                    </button>
                  </div>

                  <div className="py-12 text-center text-[#8b949e]">
                    (Chưa có chủ đề thảo luận nào trong diễn đàn này)
                  </div>

                  <div className="mt-8 pt-6 flex flex-wrap items-center justify-center gap-3">
                    <label className="text-sm text-[#8b949e]">Tìm kiếm khoá học</label>
                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        className="bg-[#0d1117] border border-[#30363d] rounded text-white px-3 py-1.5 focus:outline-none focus:border-[#58a6ff] w-48 lg:w-64 transition-colors"
                      />
                      <button className="bg-[#21262d] border border-[#30363d] hover:bg-[#30363d] text-[#c9d1d9] px-4 py-1.5 rounded transition-colors text-sm font-medium">
                        Xem
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* ================================================= */}
            {/* 📍 TAB 2: LỊCH (Chỉ hiện khi activeTab === 'calendar') */}
            {/* ================================================= */}
            {activeTab === 'calendar' && (
              <div className="animate-in fade-in duration-300 flex flex-col xl:flex-row gap-6">
                
                {/* Lịch chính (Trái) */}
                <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg p-6 shadow-sm">
                  <h2 className="text-3xl font-light text-white mb-2">Lịch</h2>
                  <p className="text-sm text-red-400 mb-6 pb-4 border-b border-[#30363d]">
                    Sinh viên xem hướng dẫn sử dụng My course tại đây (Chọn Courses/Các thao tác đến Course/2. Ở phần My courses...)
                  </p>
                  
                  {/* Giao diện khung lịch giả lập (Bạn có thể tích hợp thư viện thật sau) */}
                  <div className="flex justify-between items-center mb-4">
                    <button className="px-3 py-1 bg-[#21262d] border border-[#30363d] rounded text-sm hover:bg-[#30363d]">Tháng</button>
                    <div className="flex items-center gap-4 text-lg">
                      <button className="text-[#58a6ff] hover:text-[#79c0ff]">◄ March 2026</button>
                      <h3 className="font-semibold text-white">April 2026</h3>
                      <button className="text-[#58a6ff] hover:text-[#79c0ff]">May 2026 ►</button>
                    </div>
                  </div>

                  {/* Lưới lịch */}
                  <div className="grid grid-cols-7 gap-px bg-[#30363d] border border-[#30363d]">
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map(day => (
                      <div key={day} className="bg-[#161b22] py-2 text-center text-sm font-medium text-[#8b949e]">
                        {day}
                      </div>
                    ))}
                    {/* Render một số ô ngày giả định */}
                    {Array.from({length: 30}).map((_, i) => (
                      <div key={i} className="bg-[#0d1117] min-h-[100px] p-2 text-right text-sm text-[#c9d1d9] hover:bg-[#1f242c] transition-colors">
                        {i + 1}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sidebar Lịch (Phải) */}
                <div className="w-full xl:w-72 space-y-6">
                  {/* Khóa sự kiện */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
                    <h3 className="text-white font-medium mb-3">Khóa sự kiện</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center gap-2"><Eye className="w-4 h-4 text-[#58a6ff]" /> <span className="text-[#58a6ff]">Hide trang events</span></li>
                      <li className="flex items-center gap-2"><Eye className="w-4 h-4 text-pink-400" /> <span className="text-[#58a6ff]">Hide category events</span></li>
                      <li className="flex items-center gap-2"><Eye className="w-4 h-4 text-yellow-400" /> <span className="text-[#58a6ff]">Hide course events</span></li>
                      <li className="flex items-center gap-2"><Eye className="w-4 h-4 text-green-400" /> <span className="text-[#58a6ff]">Hide group events</span></li>
                    </ul>
                  </div>

                  {/* Xem theo tháng */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 text-center">
                    <h3 className="text-white font-medium mb-4">Xem theo tháng</h3>
                    <div className="text-[#58a6ff] mb-2 font-medium">March 2026</div>
                    <div className="text-xs text-[#8b949e] grid grid-cols-7 gap-1 mb-4">
                      {/* Lưới lịch mini giả định */}
                      <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
                      <span>...</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
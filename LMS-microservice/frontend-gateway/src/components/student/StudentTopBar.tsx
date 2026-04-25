import React from 'react';
import { Bell, MessageCircle, ChevronDown, Menu } from 'lucide-react';

export default function StudentTopBar({ user }: { user: any }) {
    return (
        <header className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 z-10">
            {/* Cột trái: Logo & Menu toggle */}
            <div className="flex items-center gap-4 w-60">
                <button className="text-[#8b949e] hover:text-white lg:hidden">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="w-10 h-10 flex items-center justify-center">
                        <img src="/logo.png" alt="Logo" className="h-8" />
                    </div>
                    {/* <span className="text-white font-semibold text-lg tracking-wide hidden sm:block">LMS System</span> */}
                    <span className="text-xl font-bold text-white italic">TDTU LMS</span>

                </div>
            </div>

            {/* Cột phải: Học kỳ, Thông báo, User */}
            <div className="flex items-center gap-4 sm:gap-6">
                {/* Dropdown Học kỳ (Mô phỏng "HK2 2526") */}
                <button className="hidden sm:flex items-center text-sm font-medium text-[#c9d1d9] hover:text-white transition-colors">
                    HK2 2526 <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                <div className="h-5 w-px bg-[#30363d] hidden sm:block"></div>

                {/* Icons */}
                <div className="flex items-center gap-3 text-[#8b949e]">
                    <button className="relative hover:text-white transition-colors">
                        <MessageCircle className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-[9px] text-white flex items-center justify-center rounded-full font-bold">0</span>
                    </button>
                    <button className="relative hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-yellow-500 text-[9px] text-black flex items-center justify-center rounded-full font-bold">6</span>
                    </button>
                </div>

                {/* Avatar (B là Avatar mặc định như ảnh) */}
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white font-bold cursor-pointer border border-[#30363d]">
                    B
                </div>
            </div>
        </header>
    );
}
import React from 'react';
import { Bell, MessageCircle, ChevronDown, Menu } from 'lucide-react';

export default function StaffTopBar({ user }: { user: any }) {
    return (
        <header className="h-14 bg-[#161b22] border-b border-[#30363d] flex items-center justify-between px-4 z-10">
            <div className="flex items-center gap-4 w-auto">
                <button className="text-[#8b949e] hover:text-white lg:hidden">
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center space-x-3">
                    {/* Logo */}
                    <div className="w-10 h-10 flex items-center justify-center">
                        <img src="../../public/logo.png" alt="Logo" className="h-8" />
                    </div>

                    {/* Khối chữ */}
                    <div className="flex flex-col">
                        <span className="text-xl font-bold text-white italic">LMS System</span>
                        <span className="text-xs text-orange-400 font-medium">Cổng Giảng Viên</span>
                    </div>
                </div>

            </div>

            <div className="flex items-center gap-4 sm:gap-6">
                <button className="hidden sm:flex items-center text-sm font-medium text-[#c9d1d9] hover:text-white transition-colors">
                    HK2 2526 <ChevronDown className="w-4 h-4 ml-1" />
                </button>

                <div className="h-5 w-px bg-[#30363d] hidden sm:block"></div>

                <div className="flex items-center gap-3 text-[#8b949e]">
                    <button className="relative hover:text-white transition-colors">
                        <MessageCircle className="w-5 h-5" />
                    </button>
                    <button className="relative hover:text-white transition-colors">
                        <Bell className="w-5 h-5" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 text-[9px] text-white flex items-center justify-center rounded-full font-bold">2</span>
                    </button>
                </div>

                {/* Avatar Giảng viên */}
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold cursor-pointer border border-[#30363d]">
                    GV
                </div>
            </div>
        </header>
    );
}
import React from 'react';
import { User, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function RoleSelectionPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0d1117] flex flex-col items-center justify-center p-4 text-white font-sans">
      {/* Logo & Tiêu đề */}
      <div className="text-center mb-12">
        <img src="/logo.png" alt="Logo" className="h-20 mx-auto mb-4" />
        <p className="text-[#8b949e] mt-2 text-lg">
          Hãy <span className="text-red-500 font-bold uppercase">chọn đối tượng</span> để <span className="text-red-500 font-bold uppercase">đăng nhập</span> vào hệ thống
        </p>
      </div>

      {/* Grid Lựa chọn */}
      <div className="grid md:grid-cols-2 gap-12 max-w-5xl w-full">

        {/* Lựa chọn 1: Giảng viên */}
        <div onClick={() => navigate('/login/staff ')} className="group cursor-pointer flex flex-col items-center">
          <div className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-8 transition-all hover:border-blue-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <div className="overflow-hidden mb-6 rounded-lg">
              <img
                src="/Lecturer.png"
                alt="Giảng viên"
                className="w-full h-48 object-contain grayscale group-hover:grayscale-0 transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-2"
              />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Giảng viên - Viên chức</h2>
              <p className="text-[#8b949e] text-sm">Nếu là Giảng viên - Viên chức hãy click vào đây để đăng nhập.</p>
            </div>
          </div>
        </div>

        {/* Lựa chọn 2: Người học */}
        <div onClick={() => navigate('/login/student/')} className="group cursor-pointer flex flex-col items-center">
          <div className="relative overflow-hidden rounded-2xl border border-[#30363d] bg-[#161b22] p-8 transition-all hover:border-green-500 hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]">

            {/* HÌNH ẢNH VỚI HIỆU ỨNG PHÌNH TO */}
            <div className="overflow-hidden mb-6 rounded-lg">
              <img
                src="/StudentGraduation.png"
                alt="Người học"
                className="w-full h-48 object-contain transition-transform grayscale group-hover:grayscale-0 duration-500 ease-out group-hover:scale-110 group-hover:rotate-2"
              />
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold mb-2">Người học</h2>
              <p className="text-[#8b949e] text-sm">Nếu là Người học hãy click vào đây để đăng nhập.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
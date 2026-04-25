import React, { useState } from 'react';
import { ClipboardList, Clock, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function StudentAssignments() {
    const [activeTab, setActiveTab] = useState<'pending' | 'submitted' | 'overdue'>('pending');
    const navigate = useNavigate(); // Khởi tạo hook điều hướng

    // Dữ liệu giả lập tổng hợp từ nhiều môn học
    const allAssignments = [
        { id: 1, course: 'IT001', courseName: 'Nhập môn Lập trình', title: 'Bài tập tuần 1: Biến và Kiểu dữ liệu', deadline: '2026-04-05 23:59', status: 'pending' },
        { id: 2, course: 'IT002', courseName: 'Cấu trúc Dữ liệu', title: 'Cài đặt DSLK Đơn', deadline: '2026-04-10 23:59', status: 'pending' },
        { id: 3, course: 'IT001', courseName: 'Nhập môn Lập trình', title: 'Báo cáo giữa kỳ', deadline: '2026-03-20 23:59', status: 'submitted' },
        { id: 4, course: 'IT003', courseName: 'Trí tuệ Nhân tạo', title: 'Tìm kiếm A*', deadline: '2026-03-15 23:59', status: 'overdue' },
    ];

    // Lọc dữ liệu theo tab
    const filteredAssignments = allAssignments.filter(a => a.status === activeTab);

    return (
        <div className="animate-in fade-in duration-300">
            <h1 className="text-2xl font-bold text-white mb-6 border-b border-[#30363d] pb-4 flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-purple-500" /> Tổng hợp Bài tập
            </h1>

            {/* Tabs điều hướng */}
            <div className="flex gap-2 mb-6 border-b border-[#30363d] pb-2">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === 'pending' ? 'bg-[#1f6feb] text-white' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}
                >
                    Cần làm ({allAssignments.filter(a => a.status === 'pending').length})
                </button>
                <button
                    onClick={() => setActiveTab('submitted')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === 'submitted' ? 'bg-[#238636] text-white' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}
                >
                    Đã nộp ({allAssignments.filter(a => a.status === 'submitted').length})
                </button>
                <button
                    onClick={() => setActiveTab('overdue')}
                    className={`px-4 py-2 text-sm font-medium rounded-t-md transition-colors ${activeTab === 'overdue' ? 'bg-red-600 text-white' : 'text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#21262d]'}`}
                >
                    Quá hạn ({allAssignments.filter(a => a.status === 'overdue').length})
                </button>
            </div>

            {/* Danh sách bài tập */}
            <div className="space-y-4">
                {filteredAssignments.length === 0 ? (
                    <div className="text-center py-10 bg-[#161b22] border border-[#30363d] rounded-lg border-dashed">
                        <CheckCircle className="w-10 h-10 text-[#8b949e] mx-auto mb-3 opacity-50" />
                        <p className="text-[#8b949e]">Không có bài tập nào trong mục này.</p>
                    </div>
                ) : (
                    filteredAssignments.map(item => (
                        <div key={item.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-[#8b949e] transition-colors">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono bg-[#30363d] text-[#c9d1d9] px-2 py-0.5 rounded">
                                        {item.course}
                                    </span>
                                    <span className="text-sm text-[#8b949e]">{item.courseName}</span>
                                </div>
                                <h3 className="text-white font-medium text-lg mb-2">{item.title}</h3>

                                {/* Trạng thái Deadline */}
                                {item.status === 'overdue' ? (
                                    <p className="text-red-400 text-sm flex items-center">
                                        <AlertCircle className="w-4 h-4 mr-1" /> Đã quá hạn: {item.deadline}
                                    </p>
                                ) : (
                                    <p className="text-[#8b949e] text-sm flex items-center">
                                        <Clock className="w-4 h-4 mr-1" /> Hạn nộp: {item.deadline}
                                    </p>
                                )}
                            </div>

                            {/* Nút hành động */}
                            {item.status === 'submitted' ? (
                                <button className="bg-green-500/10 text-green-500 border border-green-500/20 px-4 py-2 rounded-md font-medium cursor-default">
                                    Đã hoàn thành
                                </button>
                            ) : item.status === 'overdue' ? (
                                <button className="bg-[#21262d] text-[#8b949e] border border-[#30363d] px-4 py-2 rounded-md font-medium cursor-not-allowed">
                                    Đã khóa
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate(`/student/assignments/${item.id}`)}
                                    className="bg-[#1f6feb] hover:bg-[#388bfd] text-white px-6 py-2 rounded-md font-medium transition-colors"
                                >
                                    Làm bài
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
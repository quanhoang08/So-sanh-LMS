import React, { useState } from 'react';

// Giả lập Dữ liệu Bài nộp (Sẽ lấy từ API GET /api/v1/quizzes/:quizId/submissions)
const MOCK_SUBMISSIONS = [
  {
    id: 'sub-1',
    studentName: 'Nguyễn Văn A',
    quizTitle: 'Báo cáo Đồ án giữa kỳ',
    status: 'submitted', // Mới nộp, chưa chấm
    fileUrl: 'https://example.com/bao-cao.pdf',
    answers: null,
    score: null,
    feedback: '',
    submittedAt: '2026-03-29 14:30',
  },
  {
    id: 'sub-2',
    studentName: 'Trần Thị B',
    quizTitle: 'Bài tập Thực hành React',
    status: 'regrade_requested', // Đang yêu cầu phúc khảo
    fileUrl: null,
    answers: { question_1: 'A', question_2: 'C' },
    score: 7.5,
    feedback: 'Code chạy ổn nhưng chưa tối ưu Component.\n\n[Yêu cầu chấm lại]: Thầy xem lại giúp em, em có tách Component ở file Header rồi ạ.',
    submittedAt: '2026-03-28 09:15',
  },
  {
    id: 'sub-3',
    studentName: 'Lê Hoàng C',
    quizTitle: 'Báo cáo Đồ án giữa kỳ',
    status: 'graded', // Đã chấm
    fileUrl: 'https://example.com/source-code.zip',
    answers: null,
    score: 9.0,
    feedback: 'Làm bài rất xuất sắc, giao diện đẹp!',
    submittedAt: '2026-03-27 16:45',
  },
];

export function GradingManagement(){
  const [submissions, setSubmissions] = useState(MOCK_SUBMISSIONS);
  const [selectedSub, setSelectedSub] = useState<any>(null);
  const [filter, setFilter] = useState('ALL'); // ALL | submitted | regrade_requested | graded

  // State cho Form chấm điểm
  const [scoreInput, setScoreInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');

  // 1. Xử lý khi chọn 1 bài nộp để xem chi tiết
  const handleSelectSubmission = (sub: any) => {
    setSelectedSub(sub);
    setScoreInput(sub.score !== null ? sub.score.toString() : '');
    // Nếu đang xin phúc khảo, tách dòng để GV gõ phản hồi mới cho dễ
    setFeedbackInput(sub.status === 'regrade_requested' ? '' : (sub.feedback || ''));
  };

  // 2. Xử lý Submit Chấm điểm / Phản hồi phúc khảo
  const handleGradeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSub) return;

    const newScore = parseFloat(scoreInput);
    if (isNaN(newScore) || newScore < 0 || newScore > 10) {
      alert('Vui lòng nhập điểm hợp lệ từ 0 đến 10!');
      return;
    }

    // Cập nhật State cục bộ (Thực tế sẽ gọi API PUT /grade hoặc /regrade/respond)
    setSubmissions(submissions.map(s => {
      if (s.id === selectedSub.id) {
        return {
          ...s,
          score: newScore,
          status: 'graded',
          feedback: selectedSub.status === 'regrade_requested' 
            ? `${selectedSub.feedback}\n\n[Phản hồi GV]: ${feedbackInput}` 
            : feedbackInput
        };
      }
      return s;
    }));

    alert(selectedSub.status === 'regrade_requested' ? 'Đã phản hồi phúc khảo!' : 'Đã lưu điểm thành công!');
    setSelectedSub(null); // Đóng panel sau khi chấm xong
  };

  // Lọc danh sách bài nộp
  const filteredSubmissions = submissions.filter(s => filter === 'ALL' || s.status === filter);

  // Render Badge Trạng thái
  const renderStatus = (status: string) => {
    switch(status) {
      case 'submitted': return <span className="text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded text-xs">Chờ chấm</span>;
      case 'regrade_requested': return <span className="text-red-400 bg-red-400/10 px-2 py-1 rounded text-xs animate-pulse">Yêu cầu chấm lại</span>;
      case 'graded': return <span className="text-green-400 bg-green-400/10 px-2 py-1 rounded text-xs">Đã có điểm</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen flex flex-col">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold">Chấm bài & Phản hồi</h1>
          <p className="text-gray-400 text-sm mt-1">Quản lý bài nộp của sinh viên và xử lý phúc khảo</p>
        </div>
        
        {/* Bộ lọc trạng thái */}
        <select 
          className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">Tất cả bài nộp</option>
          <option value="submitted">Cần chấm (Mới nộp)</option>
          <option value="regrade_requested">Cần xử lý phúc khảo</option>
          <option value="graded">Đã chấm xong</option>
        </select>
      </div>

      <div className="flex gap-6 flex-1 h-[calc(100vh-160px)]">
        {/* Cột Trái: Danh sách Bài nộp */}
        <div className="w-1/3 bg-gray-800 rounded-xl border border-gray-700 overflow-y-auto">
          {filteredSubmissions.map(sub => (
            <div 
              key={sub.id} 
              onClick={() => handleSelectSubmission(sub)}
              className={`p-4 border-b border-gray-700 cursor-pointer transition-colors ${selectedSub?.id === sub.id ? 'bg-indigo-900/40 border-l-4 border-l-indigo-500' : 'hover:bg-gray-700'}`}
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold">{sub.studentName}</h3>
                {renderStatus(sub.status)}
              </div>
              <p className="text-sm text-gray-400 line-clamp-1">{sub.quizTitle}</p>
              <p className="text-xs text-gray-500 mt-2">Nộp lúc: {sub.submittedAt}</p>
            </div>
          ))}
          {filteredSubmissions.length === 0 && (
            <div className="p-8 text-center text-gray-500">Không có bài nộp nào phù hợp.</div>
          )}
        </div>

        {/* Cột Phải: Không gian Chấm điểm (Chỉ hiện khi có selectedSub) */}
        <div className="w-2/3 bg-gray-800 rounded-xl border border-gray-700 flex flex-col">
          {selectedSub ? (
            <>
              {/* Thông tin bài làm */}
              <div className="p-6 border-b border-gray-700 bg-gray-800/50 rounded-t-xl">
                <h2 className="text-xl font-bold mb-1">Bài làm của: {selectedSub.studentName}</h2>
                <p className="text-indigo-400 mb-4">{selectedSub.quizTitle}</p>
                
                {/* Hiển thị File đính kèm hoặc Đáp án Trắc nghiệm */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-400 mb-2">Nội dung nộp:</h4>
                  {selectedSub.fileUrl ? (
                    <a href={selectedSub.fileUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                      📄 <span>Tải xuống tệp đính kèm (Báo cáo / Source code)</span>
                    </a>
                  ) : (
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                      {JSON.stringify(selectedSub.answers, null, 2)}
                    </pre>
                  )}
                </div>

                {/* Nếu là yêu cầu phúc khảo, hiển thị lý do nổi bật */}
                {selectedSub.status === 'regrade_requested' && (
                  <div className="mt-4 p-4 bg-red-900/30 border border-red-500/50 rounded-lg">
                    <h4 className="text-red-400 font-semibold mb-1">🚨 Sinh viên yêu cầu chấm lại:</h4>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">{selectedSub.feedback}</p>
                  </div>
                )}
              </div>

              {/* Form nhập Điểm và Feedback */}
              <form onSubmit={handleGradeSubmit} className="p-6 flex flex-col flex-1">
                <div className="flex gap-6 mb-4">
                  <div className="w-1/3">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Điểm số (Hệ 10)</label>
                    <input 
                      type="number" 
                      step="0.1"
                      required
                      className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-xl font-bold focus:outline-none focus:border-indigo-500"
                      value={scoreInput}
                      onChange={(e) => setScoreInput(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col mb-4">
                  <label className="block text-sm font-medium text-gray-400 mb-2">
                    {selectedSub.status === 'regrade_requested' ? 'Phản hồi phúc khảo cho sinh viên' : 'Nhận xét / Góp ý'}
                  </label>
                  <textarea 
                    className="w-full flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none"
                    placeholder="Nhập nhận xét của giảng viên..."
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                  ></textarea>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
                  <button 
                    type="button" 
                    onClick={() => setSelectedSub(null)}
                    className="px-6 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
                  >
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium transition-colors shadow-lg shadow-indigo-900/20"
                  >
                    {selectedSub.status === 'regrade_requested' ? 'Cập nhật điểm & Phản hồi' : 'Lưu Điểm'}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500 flex-col">
              <span className="text-4xl mb-3">📝</span>
              <p>Chọn một bài nộp từ danh sách bên trái để bắt đầu chấm điểm.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

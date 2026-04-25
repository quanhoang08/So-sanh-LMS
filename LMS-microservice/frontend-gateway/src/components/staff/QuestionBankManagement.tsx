import React, { useState } from 'react';

// Giả lập Dữ liệu Ngân hàng câu hỏi
const MOCK_QUESTIONS = [
  {
    id: 'q1',
    courseId: 'c1',
    courseName: 'Phát triển Web với React',
    type: 'multiple_choice',
    difficulty: 'easy',
    content: 'React là gì?',
    options: ['A. Một thư viện UI của JavaScript', 'B. Một hệ điều hành', 'C. Một ngôn ngữ backend', 'D. Một database'],
    correctAnswer: 'A',
  },
  {
    id: 'q2',
    courseId: 'c1',
    courseName: 'Phát triển Web với React',
    type: 'essay',
    difficulty: 'hard',
    content: 'Hãy giải thích cơ chế hoạt động của Virtual DOM trong React và tại sao nó lại giúp tăng hiệu suất render?',
    options: [],
    correctAnswer: '',
  },
  {
    id: 'q3',
    courseId: 'c2',
    courseName: 'Cơ sở dữ liệu PostgreSQL',
    type: 'multiple_choice',
    difficulty: 'medium',
    content: 'Lệnh nào dùng để xóa toàn bộ dữ liệu trong bảng mà không ghi log từng dòng?',
    options: ['A. DELETE * FROM table', 'B. DROP TABLE table', 'C. TRUNCATE TABLE table', 'D. REMOVE FROM table'],
    correctAnswer: 'C',
  },
];

export function QuestionBankManagement() {
  const [questions, setQuestions] = useState(MOCK_QUESTIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('ALL');
  const [filterType, setFilterType] = useState('ALL');
  
  // State quản lý Modal thêm/sửa câu hỏi
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    type: 'multiple_choice',
    difficulty: 'medium',
    content: '',
    options: ['', '', '', ''],
    correctAnswer: 'A'
  });

  // Lọc câu hỏi dựa trên Search, Độ khó và Loại
  const filteredQuestions = questions.filter(q => {
    const matchSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDifficulty = filterDifficulty === 'ALL' || q.difficulty === filterDifficulty;
    const matchType = filterType === 'ALL' || q.type === filterType;
    return matchSearch && matchDifficulty && matchType;
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa câu hỏi này khỏi ngân hàng?')) {
      setQuestions(questions.filter(q => q.id !== id));
    }
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.content.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    const questionToAdd = {
      id: `q${Date.now()}`,
      courseId: 'c_custom',
      courseName: 'Khóa học Tùy chỉnh', // Thực tế sẽ lấy từ select box khóa học
      ...newQuestion
    };

    setQuestions([questionToAdd, ...questions]);
    setIsModalOpen(false);
    // Reset form
    setNewQuestion({ type: 'multiple_choice', difficulty: 'medium', content: '', options: ['', '', '', ''], correctAnswer: 'A' });
    alert('Đã thêm câu hỏi vào ngân hàng!');
  };

  // Render Badge Độ khó
  const renderDifficulty = (level: string) => {
    switch(level) {
      case 'easy': return <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded text-xs border border-green-500/20">Dễ</span>;
      case 'medium': return <span className="text-yellow-400 bg-yellow-400/10 px-2 py-0.5 rounded text-xs border border-yellow-500/20">Trung bình</span>;
      case 'hard': return <span className="text-red-400 bg-red-400/10 px-2 py-0.5 rounded text-xs border border-red-500/20">Khó</span>;
      default: return null;
    }
  };

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen relative">
      {/* Header & Công cụ tìm kiếm/lọc */}
      <div className="mb-6 flex flex-col md:flex-row justify-between md:items-end gap-4">
        <div>
          <h1 className="text-2xl font-bold">Ngân hàng Câu hỏi</h1>
          <p className="text-gray-400 text-sm mt-1">Quản lý và tái sử dụng câu hỏi cho các bài kiểm tra</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <input 
            type="text" 
            placeholder="🔍 Tìm nội dung câu hỏi..." 
            className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 flex-1 md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select 
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="ALL">Mọi thể loại</option>
            <option value="multiple_choice">Trắc nghiệm</option>
            <option value="essay">Tự luận</option>
          </select>
          <select 
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
          >
            <option value="ALL">Mọi độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            + Thêm Câu hỏi
          </button>
        </div>
      </div>

      {/* Danh sách Câu hỏi */}
      <div className="space-y-4">
        {filteredQuestions.map(q => (
          <div key={q.id} className="bg-gray-800 border border-gray-700 rounded-xl p-5 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">
                  {q.courseName}
                </span>
                {renderDifficulty(q.difficulty)}
                <span className="text-xs text-gray-400">{q.type === 'multiple_choice' ? '🔘 Trắc nghiệm' : '✍️ Tự luận'}</span>
              </div>
              <div className="flex gap-2">
                <button className="text-gray-400 hover:text-white transition-colors text-sm bg-gray-700 px-3 py-1 rounded">Sửa</button>
                <button onClick={() => handleDelete(q.id)} className="text-red-400 hover:text-red-300 transition-colors text-sm bg-red-900/30 px-3 py-1 rounded border border-red-900/50">Xóa</button>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-3">{q.content}</h3>
            
            {q.type === 'multiple_choice' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {q.options.map((opt, idx) => {
                  const isCorrect = q.correctAnswer === String.fromCharCode(65 + idx); // A, B, C, D
                  return (
                    <div key={idx} className={`p-2 rounded text-sm border ${isCorrect ? 'bg-green-900/20 border-green-500/50 text-green-300' : 'bg-gray-900 border-gray-700 text-gray-400'}`}>
                      {opt} {isCorrect && ' ✓'}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
        
        {filteredQuestions.length === 0 && (
          <div className="text-center p-10 bg-gray-800 rounded-xl border border-gray-700 text-gray-500">
            Không tìm thấy câu hỏi nào phù hợp với bộ lọc.
          </div>
        )}
      </div>

      {/* Modal Thêm Câu hỏi */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-700 flex justify-between items-center bg-gray-800/80">
              <h2 className="text-xl font-bold">Thêm Câu hỏi mới</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSaveQuestion} className="p-6 overflow-y-auto flex-1 flex flex-col gap-4 custom-scrollbar">
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Loại câu hỏi</label>
                  <select 
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                    value={newQuestion.type}
                    onChange={(e) => setNewQuestion({...newQuestion, type: e.target.value})}
                  >
                    <option value="multiple_choice">Trắc nghiệm nhiều lựa chọn</option>
                    <option value="essay">Tự luận / Tự viết code</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-400 mb-1">Độ khó</label>
                  <select 
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                    value={newQuestion.difficulty}
                    onChange={(e) => setNewQuestion({...newQuestion, difficulty: e.target.value})}
                  >
                    <option value="easy">Dễ</option>
                    <option value="medium">Trung bình</option>
                    <option value="hard">Khó</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nội dung câu hỏi</label>
                <textarea 
                  required
                  rows={4}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-indigo-500 resize-none"
                  placeholder="Nhập đề bài..."
                  value={newQuestion.content}
                  onChange={(e) => setNewQuestion({...newQuestion, content: e.target.value})}
                ></textarea>
              </div>

              {/* Form Động: Chỉ hiện khi là Trắc nghiệm */}
              {newQuestion.type === 'multiple_choice' && (
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <div className="flex justify-between items-end mb-3">
                    <label className="block text-sm font-medium text-gray-400">Các đáp án</label>
                    <label className="block text-sm font-medium text-green-400">Chọn đáp án đúng</label>
                  </div>
                  
                  {newQuestion.options.map((opt, idx) => {
                    const letter = String.fromCharCode(65 + idx); // A, B, C, D
                    return (
                      <div key={idx} className="flex gap-3 mb-2 items-center">
                        <span className="font-bold text-gray-500 w-6">{letter}.</span>
                        <input 
                          type="text" 
                          required
                          placeholder={`Nhập đáp án ${letter}...`}
                          className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                          value={opt}
                          onChange={(e) => {
                            const newOpts = [...newQuestion.options];
                            newOpts[idx] = e.target.value;
                            setNewQuestion({...newQuestion, options: newOpts});
                          }}
                        />
                        <input 
                          type="radio" 
                          name="correctAnswer" 
                          className="w-5 h-5 accent-green-500 cursor-pointer"
                          checked={newQuestion.correctAnswer === letter}
                          onChange={() => setNewQuestion({...newQuestion, correctAnswer: letter})}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </form>

            <div className="p-5 border-t border-gray-700 bg-gray-800/80 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleSaveQuestion}
                className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 font-medium transition-colors shadow-lg shadow-indigo-900/20"
              >
                Lưu vào Ngân hàng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';

const QuizSubmission = ({ quizId = 'quiz-uuid-123' }) => {
  // 1. State lưu trữ dữ liệu
  const [file, setFile] = useState(null);
  const [answers, setAnswers] = useState({ question_1: '', question_2: '' });
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error
  const [message, setMessage] = useState('');

  // 2. Xử lý khi chọn file
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  // 3. Xử lý khi chọn đáp án trắc nghiệm
  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  // 4. Hàm Submit gửi dữ liệu lên Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    setMessage('');

    try {
      // BẮT BUỘC: Phải dùng FormData khi có Upload File
      const formData = new FormData();
      
      // Đính kèm file (Nếu có)
      if (file) {
        formData.append('file', file);
      }

      // Đính kèm đáp án trắc nghiệm (Chuyển thành chuỗi JSON)
      formData.append('answers', JSON.stringify(answers));

      // Lấy Token từ LocalStorage (Giả lập)
      const token = localStorage.getItem('accessToken') || 'fake-jwt-token';

      // Gọi API NestJS
      const response = await fetch(`http://localhost:3000/api/v1/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          // LƯU Ý CỰC QUAN TRỌNG: KHÔNG ĐƯỢC set 'Content-Type': 'multipart/form-data' thủ công ở đây. 
          // Trình duyệt sẽ tự động set kèm theo cái 'boundary' chính xác.
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra khi nộp bài!');
      }

      setStatus('success');
      setMessage('🎉 Nộp bài thành công!');
      
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Nộp Bài Kiểm Tra</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Phần Trắc nghiệm */}
        <div style={{ marginBottom: '20px' }}>
          <h4>Câu 1: React là gì?</h4>
          <label>
            <input type="radio" name="q1" value="A" onChange={() => handleAnswerChange('question_1', 'A')} /> A. Thư viện UI
          </label>
          <br/>
          <label>
            <input type="radio" name="q1" value="B" onChange={() => handleAnswerChange('question_1', 'B')} /> B. Hệ điều hành
          </label>
        </div>

        {/* Phần File Tự luận/Báo cáo */}
        <div style={{ marginBottom: '20px' }}>
          <h4>Đính kèm File báo cáo (PDF, ZIP...):</h4>
          <input type="file" onChange={handleFileChange} accept=".pdf,.zip,.rar,.docx" />
        </div>

        {/* Nút Submit */}
        <button 
          type="submit" 
          disabled={status === 'submitting'}
          style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none' }}
        >
          {status === 'submitting' ? 'Đang nộp bài...' : 'Nộp Bài'}
        </button>
      </form>

      {/* Hiển thị thông báo */}
      {message && (
        <p style={{ color: status === 'success' ? 'green' : 'red', marginTop: '15px' }}>
          {message}
        </p>
      )}
    </div>
  );
};

export default QuizSubmission;
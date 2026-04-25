import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StudentSidebar from '../components/student/StudentSidebar';
import StudentTopBar from '../components/student/StudentTopBar';
import StudentCourseList from '../components/student/StudentCourseList';
import StudentAttendance from '../components/student/StudentAttendance';
import StudentCourseDetail from '../components/student/StudentCourseDetail';
import StudentProfile from '../components/student/StudentProfile';
import StudentAssignments from '../components/student/StudentAssignments';
import StudentAssignmentDetail from '../components/student/StudentAssignmentDetail';
import EditProfilePage from './EditProfilePage';

// (Giả sử bạn đã có component Profile. Nếu chưa, dùng tạm component cũ)
// const StudentProfile = () => <div className="text-white text-xl">Đây là trang Hồ sơ cá nhân</div>;
// const StudentCourseDetail = () => <div className="text-white text-xl">Đây là trang Chi tiết khóa học</div>;
// const StudentAttendance = () => <div className="text-white text-xl">Đây là trang Điểm danh</div>;

export default function StudentLayout({ user }: { user: any }) {
  return (
    <div className="flex flex-col h-screen bg-[#0d1117] overflow-hidden font-sans">
      <StudentTopBar user={user} />

      <div className="flex flex-1 overflow-hidden">
        <div className="hidden lg:block">
          <StudentSidebar />
        </div>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {/* 🚀 ĐÂY LÀ KHU VỰC ĐỊNH TUYẾN CHÍNH XÁC THEO YÊU CẦU CỦA BẠN */}
            <Routes>

              <Route index element={<StudentProfile />} />
              {/* <Route path="/student"  /> */}
              <Route path="/attendance" element={<StudentAttendance />} /> {/* Mới thêm */}
              <Route path="/edit" element={<EditProfilePage />} /> {/* 👈 Thêm dòng này */}
              <Route path="/courses" element={<StudentCourseList />} />

              <Route path="/course/:id" element={<StudentCourseDetail />} />
              <Route path="/course/:id/assignments" element={<StudentAssignments />} />
              <Route path="/course/:id/assignments/:assignmentId" element={<StudentAssignmentDetail />} />

            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}
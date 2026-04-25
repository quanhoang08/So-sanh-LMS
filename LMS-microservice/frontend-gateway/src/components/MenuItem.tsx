import { LayoutDashboard, Users, Settings, BookOpen, FileText } from 'lucide-react';

// Thêm thuộc tính 'roles' cho mỗi menu
export const menuItems = [
  { 
    name: 'Dashboard', 
    path: '/admin/dashboard', 
    icon: LayoutDashboard, 
    roles: ['ADMIN', 'TEACHER', 'ACADEMIC_MANAGER'] // Ai cũng thấy
  },
  { 
    name: 'Quản lý User', 
    path: '/admin/users', 
    icon: Users, 
    roles: ['ADMIN'] // Chỉ IT Admin thấy
  },
  { 
    name: 'Cài đặt hệ thống', 
    path: '/admin/settings', 
    icon: Settings, 
    roles: ['ADMIN'] // Chỉ IT Admin thấy
  },
  { 
    name: 'Quản lý Khóa học', 
    path: '/admin/courses', 
    icon: BookOpen, 
    roles: ['TEACHER', 'ACADEMIC_MANAGER'] // Admin sẽ KHÔNG thấy nút này
  },
  { 
    name: 'Chấm điểm & Bài thi', 
    path: '/admin/grades', 
    icon: FileText, 
    roles: ['TEACHER'] // Admin sẽ KHÔNG thấy nút này
  },
];
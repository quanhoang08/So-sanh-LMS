import { useState, useEffect } from 'react';
import { Search, Plus, MoreHorizontal, ChevronLeft, ChevronRight, User } from 'lucide-react';
import axiosClient from '../api/axios-client'; // 🌟 Import axiosClient
import Sidebar from '../components/Sidebar';
import { UserTableRow } from '../components/UserTableRow';
import { Pagination } from '../components/Pagination';
import { TableSkeleton } from '../components/TableSkeleton';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';

export default function UsersManagementPage() {
  // State lưu trữ danh sách user từ DB
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Cố định 5 record 1 trang như UI của bạn

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Quan trọng: Reset về trang 1 khi tìm kiếm
  };
  // 🎯 GỌI API LẤY DANH SÁCH USER
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        // Gọi đến API của AdminController
        const response = await axiosClient.get('/api/v1/admin/list_users');

        // Trích xuất dữ liệu từ response (bọc trong { data: ... })
        const userData = response.data.data;

        // Đảm bảo dữ liệu là mảng trước khi set vào state
        if (Array.isArray(userData)) {
          setUsers(userData);
        } else if (userData && Array.isArray(userData.items)) {
          // Trường hợp Backend trả về cấu trúc phân trang { items: [], total: ... }
          setUsers(userData.items);
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách người dùng:", error);
        setUsers([]); // Tránh lỗi crash giao diện nếu API sập
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []); // [] đảm bảo chỉ gọi 1 lần khi render

  // Hàm render màu sắc cho trạng thái (Status)
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'INACTIVE': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'SUSPENDED': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  // Format ngày tháng (Vì DB thường trả về chuỗi ISO: 2023-10-15T08:00:00Z)
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(date);
  };

  // Lọc dữ liệu trên Frontend (Tạm thời)
  const filteredUsers = users.filter(u =>
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 2. Tính toán các chỉ số phân trang
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // 3. MẢNG CUỐI CÙNG ĐỂ RENDER RA BẢNG: Chỉ lấy đúng 5 phần tử
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const emptyRows = itemsPerPage - currentUsers.length;

  // 🌟 States cho Modal Thêm người dùng
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);


  // State cho Modal Đổi Role
  const [newRole, setNewRole] = useState('');


  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    role: 'STUDENT',
    status: "ACTIVE"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault(); // Ngăn trang bị reload

    if (!newUserData.email || !newUserData.password) {
      alert("Vui lòng nhập đầy đủ Email và Mật khẩu!");
      return;
    }

    try {
      setIsSubmitting(true);
      // Gọi API POST tới AdminController của bạn (ví dụ: /api/v1/admin/users)
      await axiosClient.post('/api/v1/admin/create', newUserData);

      // Nếu thành công:
      alert("Tạo người dùng thành công!");
      setIsAddModalOpen(false); // Đóng Modal
      setNewUserData({ email: '', password: '', role: 'STUDENT', status: "ACTIVE" }); // Reset form

      // TODO: Tự động load lại danh sách user (gọi lại fetchUsers)
      // Tạm thời để đơn giản, ta có thể reload trang hoặc viết lại logic fetch
      window.location.reload();
    } catch (error: any) {
      console.error("Chi tiết lỗi từ Backend:", error.response?.data);
      const errorPayload = error.response?.data?.message;
      let errorText = "Đã xảy ra lỗi khi tạo người dùng.";

      // Kiểm tra nếu lỗi trả về là một mảng
      if (Array.isArray(errorPayload)) {
        const messages = errorPayload.map((err: any) => {
          // Trường hợp 1: Nếu nó đã là chuỗi sẵn
          if (typeof err === 'string') return err;

          // Trường hợp 2: Nếu nó là object lỗi của class-validator (chứa constraints)
          if (err && err.constraints) {
            return Object.values(err.constraints).join(', ');
          }

          // Trường hợp 3: Fallback an toàn, ép kiểu object thành chuỗi JSON để ít nhất mình cũng đọc được
          return JSON.stringify(err);
        });

        errorText = "Lỗi dữ liệu:\n- " + messages.join('\n- ');
      }
      // Kiểm tra nếu lỗi trả về chỉ là một chuỗi bình thường
      else if (typeof errorPayload === 'string') {
        errorText = errorPayload;
      }

      // Bật thông báo
      alert(errorText);
    }
    finally {
      setIsSubmitting(false);
    }
  };

  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  return (
    <div className="flex-1 ml-64 min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <Sidebar />

      <main className="pt-20 px-8 pb-8">
        <div className="max-w-7xl mx-auto">

          {/* Header Section */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#30363d]">
            <div>
              <h1 className="text-2xl font-semibold text-white">Quản lý Người dùng</h1>
              <p className="text-sm text-[#8b949e] mt-1">Xem, thêm mới và phân quyền tài khoản hệ thống.</p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)} // 👈 Thêm dòng này
              className="flex items-center px-4 py-2 !bg-[#30363d] !text-white hover:bg-[#2ea043]  text-sm font-medium rounded-md transition-colors border border-transparent shadow-sm">
              <Plus className="w-4 h-4 mr-2" />
              Thêm người dùng
            </button>
          </div>

          {/* Table Container */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-md pb-16">
            {/* Toolbar: Search & Filter */}
            <div className="w-full">
              <SearchBar
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Tìm kiếm theo email..."
              />
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="bg-[#161b22] border-b border-[#30363d] text-[#8b949e]">
                    <th className="px-6 py-3 font-medium">Người dùng</th>
                    <th className="px-6 py-3 font-medium">Vai trò (Role)</th>
                    <th className="px-6 py-3 font-medium">Trạng thái</th>
                    <th className="px-6 py-3 font-medium">Ngày tham gia</th>
                    <th className="px-6 py-3 font-medium text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">

                  {isLoading ? (
                    <TableSkeleton rows={5} />
                  ) : filteredUsers.length === 0 ? (
                    <EmptyState
                      colSpan={5}
                      message={searchTerm ? `Không tìm thấy người dùng nào khớp với "${searchTerm}".` : "Chưa có người dùng nào trong hệ thống."}
                    />
                  ) : (
                    <>
                      {/* 1. In ra các user trong trang hiện tại */}
                      {currentUsers.map((user, index) => {
                        // Kiểm tra xem user này có nằm ở 1 hoặc 2 vị trí cuối của trang không
                        const isNearBottom = index >= currentUsers.length - 2;

                        return (
                          <UserTableRow
                            key={user.id || user._id}
                            user={user}
                            getStatusStyle={getStatusStyle}
                            formatDate={formatDate}
                            onRefresh={() => window.location.reload()}
                            isOpen={openDropdownId === (user.id || user._id)}

                            // 👇 Sửa lại dòng này, xóa bỏ dấu ... đi và truyền đúng logic vào
                            onToggle={() => setOpenDropdownId(openDropdownId === (user.id || user._id) ? null : (user.id || user._id))}

                            isNearBottom={isNearBottom} // Truyền thêm prop này
                          />
                        );
                      })}

                      {/* 2. In ra các hàng trống (Ghost Rows) */}
                      {emptyRows > 0 && emptyRows < itemsPerPage && (
                        Array.from({ length: emptyRows }).map((_, index) => (
                          <tr key={`empty-${index}`} className="h-[57px] opacity-0 pointer-events-none">
                            <td colSpan={5}></td>
                          </tr>
                        ))
                      )}
                    </>
                  )}

                </tbody>
              </table>
            </div>

            {/* 🚀 BỘ ĐIỀU HƯỚNG PHÂN TRANG */}
            <Pagination
              totalItems={filteredUsers.length}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(newPage) => setCurrentPage(newPage)}
              itemName="người dùng"
            />

          </div>
        </div>
      </main>

      {/* ========================================================= */}
      {/* 🚀 MODAL: THÊM NGƯỜI DÙNG */}
      {/* ========================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity">

          {/* Hộp thoại Modal */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">

            {/* Header của Modal */}
            <div className="px-6 py-4 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
              <h2 className="text-lg font-semibold text-white">Tạo tài khoản mới</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#8b949e] hover:text-white transition-colors p-1"
              >
                ✕ {/* Dùng icon X thay vì chữ X thì đẹp hơn */}
              </button>
            </div>

            {/* Form nhập liệu */}
            <form onSubmit={handleCreateUser}>
              <div className="p-6 space-y-4">

                {/* Trường Email */}
                <div>
                  <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                    Địa chỉ Email <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({ ...newUserData, email: e.target.value })}
                    placeholder="nguyenvana@example.com"
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-[#8b949e]"
                  />
                </div>

                {/* Trường Mật khẩu */}
                <div>
                  <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                    Mật khẩu <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={newUserData.password}
                    onChange={(e) => setNewUserData({ ...newUserData, password: e.target.value })}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all placeholder-[#8b949e]"
                  />
                </div>

                {/* Dropdown Vai trò */}
                <div>
                  <label className="block text-sm font-medium text-[#c9d1d9] mb-1">
                    Vai trò (Role)
                  </label>
                  <select
                    value={newUserData.role}
                    onChange={(e) => setNewUserData({ ...newUserData, role: e.target.value })}
                    className="w-full px-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-md text-sm text-[#c9d1d9] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  >
                    <option value="STUDENT">Học viên (Student)</option>
                    <option value="LECTURER">Giảng viên (Lecturer)</option>
                    <option value="ADMIN">Quản trị viên (Admin)</option>
                  </select>
                </div>

              </div>

              {/* Khu vực Nút bấm cuối Form */}
              <div className="px-6 py-4 border-t border-[#30363d] bg-[#0d1117] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-black hover:text-[#c9d1d9] bg-transparent border border-[#30363d] rounded-md hover:bg-[#30363d] transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-black hover:text-[#c9d1d9] bg-[#238636] hover:bg-[#2ea043] border border-transparent rounded-md transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/20   border-t-white rounded-full animate-spin mr-2"></span>
                      Đang xử lý...
                    </>
                  ) : (
                    "Lưu người dùng"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}
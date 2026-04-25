import { Controller, Post, Body, HttpCode, HttpStatus, Req, UseGuards, Get, Query, Param, Patch } from "@nestjs/common";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { RegisterDto, LoginDto, CreateUserDto, ChangeRoleDto } from "../user/user.dto";
import { UserRole } from "../user/user.enum";
import { UserService } from "../user/user.service";

@Controller('admin')
export class AdminController {
  constructor(private readonly userService: UserService) { }
  @Post('/register')
  async registerAdmin(
    @Body() registerDto: RegisterDto,
  ) {
    // Lấy mã bí mật từ cấu hình môi trường (ví dụ: 'MY_SUPER_SECRET_KEY')
    const expectedSecret = process.env.ADMIN_REGISTER_SECRET;

    // Nếu đúng Secret, gọi sang một hàm registerAdmin riêng bên AuthService 
    // (hàm này cho phép tạo role ADMIN, status ACTIVE luôn)
    return this.userService.register(registerDto);
  }

  /**
   * @async
   * @param {Request} req 
   * @param {LoginDto} loginDto 
   * @returns {unknown} 
   * @description: Đăng nhập với tư cách là admin
   *  ex: // POST http://localhost:3001/api/v1/admin/login
      {
        "email": "admin@example.com",
        "password": "hashed_admin_pw",
        "role":"ADMIN"
      }
   */
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Req() req: Request, @Body() loginDto: LoginDto) {
    const newUser = await this.userService.login(loginDto);
    return {
      message: 'Đăng nhập thành công',
      data: newUser,
    };
  }
  /**
     * 1. TẠO TÀI KHOẢN NGƯỜI DÙNG (Chỉ Quản trị viên)
     * POST /api/v1/admin/create
     * @Body CreateUserDto
     */
  @Post("/create")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.CREATED) // Trả về HTTP 201
  async createUser(@Body() createUserDto: CreateUserDto) {
    const newUser = await this.userService.create(createUserDto);
    return {
      message: 'Tạo tài khoản thành công',
      data: newUser,
    };
  }

  /**
   * @description: TÌM KIẾM & LỌC NGƯỜI DÙNG (Chỉ Quản trị viên)
   *             GET http://localhost:3001/api/v1/admin/list_users
   */
  @Get('/list_users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK) // Trả về HTTP 200
  async searchUsers(@Query() query: any) {
    const users = await this.userService.searchUsers(query);
    return {
      message: 'Lấy danh sách người dùng thành công',
      data: users,
    };
  }

  /**
   * 4. XEM THÔNG TIN MỘT NGƯỜI DÙNG
   * GET /api/v1/admin/list_users/:id
   * @Param id
   */
  @Get('/list_users/:id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id') id: number) {
    const user = await this.userService.findOne(id);
    return {
      message: 'Lấy thông tin người dùng thành công',
      data: user,
    };
  }

  /**
   * @description PHÂN QUYỀN NGƯỜI DÙNG (Chỉ Quản trị viên)
   * Lưu ý: trước khi test, phải có token từ api đăng nhập ở trên
   * PATCH http://localhost:3001/api/v1/admin/list_users/45/role
   * @Body      
   *  {
        "role": "STUDENT",
        "status": "ACTIVE"
      }
   */
  @Patch('/list_users/:id/role')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async changeRole(
    @Param('id') id: number,
    @Body() changeRoleDto: ChangeRoleDto,
  ) {
    const updatedUser = await this.userService.changeRole(id, changeRoleDto);
    return {
      message: 'Cập nhật quyền thành công',
      data: updatedUser,
    };
  }

  /**
   * 7. VÔ HIỆU HÓA TÀI KHOẢN (Chỉ Quản trị viên)
   * PATCH /api/v1/users/:id/disable
   * @Param id
   * @Body ChangeRoleDto (Sử dụng lại DTO có chứa status theo hàm disableAccount ở Service)
   */
  @Patch(':id/disable')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async disableAccount(
    @Param('id') id: number,
    @Body() disableDto: ChangeRoleDto,
  ) {
    const disabledUser = await this.userService.disableAccount(id, disableDto);
    return {
      message: 'Vô hiệu hóa tài khoản thành công',
      data: disabledUser,
    };
  }

  /**
   * @description LẤY THỐNG KÊ DASHBOARD (API TỔNG HỢP)
   * GET http://localhost:3001/api/v1/admin/stats
   * Lưu ý: Frontend gọi API này nên cần trả về đúng format
   */
  @Get('/stats')
  @UseGuards(JwtAuthGuard) // Chỉ cần Auth, không cần RoleGuard vì ta xử lý role bên trong hàm
  @HttpCode(HttpStatus.OK)
  async getDashboardStats(@Req() req: any) {
    const userRole = req.user.role;

    let statsData = {};

    if (userRole === UserRole.ADMIN) {
      // 🚀 GỌI DATABASE THẬT TẠI ĐÂY
      const totalUsers = await this.userService.countAllUsers();
      const totalStudents = await this.userService.countUsersByRole(UserRole.STUDENT);
      const totalLecturers = await this.userService.countUsersByRole(UserRole.LECTURER); // Hoặc LECTURER tùy định nghĩa enum của bạn

      // Nếu bạn chưa có bảng Department, có thể tạm để 0, hoặc gọi hàm đếm Department
      // const totalDepartments = await this.departmentService.countAll();
      const totalDepartments = 5;

      statsData = {
        totalUsers: totalUsers,
        totalStudents: totalStudents,
        totalLecturers: totalLecturers,
        totalDepartments: totalDepartments
      };

    } else if (userRole === UserRole.LECTURER || userRole === UserRole.DEPARTMENT_HEAD) {
      // ... logic cho giáo viên ...
      statsData = {
        myStudents: 0,
        activeCourses: 0,
        pendingGrades: 0,
        unreadQuestions: 0
      };
    }

    return {
      message: 'Lấy dữ liệu thống kê thành công',
      data: statsData
    };
  }

  
}
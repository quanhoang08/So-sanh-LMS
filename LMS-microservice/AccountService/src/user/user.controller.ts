import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
  ConflictException,
  InternalServerErrorException
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  CreateUserDto,
  RegisterDto,
  ChangePasswordDto,
  ChangeRoleDto,
  LoginDto
} from './user.dto';
import { UserRole } from './user.enum';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * 1. ĐĂNG KÝ TÀI KHOẢN (Public / Guest)
   * POST /api/v1/users/register
   * @Body RegisterDto
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Trả về HTTP 201
  async register(@Body() registerDto: RegisterDto) {
    const newUser = await this.userService.register(registerDto);
    // Có thể map sang Response DTO để ẩn passwordHash
    return {
      message: 'Đăng ký tài khoản thành công',
      data: newUser,
    };
  }

  /**
   * Description: Đăng nhập với tư cách là người dùng (không phải admin)
   * // POST http://localhost:3001/api/v1/users/login
    {
      "email": "student1@example.com",
      "password": "hashed_student_pw",
      "role": "STUDENT"
    }
   * @async
   * @param {LoginDto} loginDto 
   * @returns {unknown} 
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto) {
    // UserController đóng vai trò "cửa ngõ", gọi sang AuthService để xử lý JWT
    const result = await this.userService.login(loginDto);
    return {
      message: 'Đăng nhập thành công',
      data: result, // Trả về AccessToken và thông tin User
    };
  }

  @Patch(':id/password')
  @UseGuards(JwtAuthGuard)
  async changePassword(@Param('id') id: number, @Body() dto: ChangePasswordDto) {
    await this.userService.changePassword(id, dto);
    return { message: 'Đổi mật khẩu thành công' };
  }
}


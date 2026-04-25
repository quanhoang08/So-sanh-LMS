import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  Res,
  Req,
  BadRequestException,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { type Response, type Request } from 'express';
import { AuthService } from '../services/auth.service';
import { RegisterDto } from '../dto/register.dto';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  ChangePasswordDto,
} from '../dto/auth-password.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';

@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * POST /api/v1/auth/register
   *
   * Nhận @Body() dạng Record<string, any> (raw body) để tự normalize
   * trước khi validate — tránh vấn đề @Transform không map được
   * khi key của client không khớp chính xác với property name của DTO.
   *
   * Flow:
   *   1. Nhận raw body
   *   2. Normalize: gán confirmPassword từ bất kỳ key variant nào
   *   3. plainToInstance → DTO instance
   *   4. validate → throw nếu có lỗi
   *   5. So sánh password === confirmPassword
   *   6. Gọi service
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() body: Record<string, any>) {
    // Bước 1: Normalize key trước khi bind vào DTO
    // Client có thể gửi: "confirmPassword", "confirmpassword", "confirm_password"
    // → chuẩn hóa tất cả về "confirmPassword"
    const normalizedBody = {
      ...body,
      confirmPassword:
        body['confirmPassword'] ??      // camelCase — chuẩn
        body['confirmpassword'] ??      // lowercase  ← Postman trong ảnh
        body['confirm_password'],       // snake_case
    };

    // Bước 2: Tạo DTO instance và validate thủ công
    const dto = plainToInstance(RegisterDto, normalizedBody);
    const errors = await validate(dto);

    if (errors.length > 0) {
      const messages = errors.flatMap((e) =>
        Object.values(e.constraints ?? {}),
      );
      throw new BadRequestException(messages);
    }

    // Bước 3: So sánh password
    if (dto.password !== dto.confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp.');
    }

    // Bước 4: Gọi service (không truyền confirmPassword)
    const { confirmPassword, ...registerDto } = dto;
    return this.authService.register(registerDto);
  }

  /**
   * POST /api/v1/auth/login
   *
   * Thay đổi so với code cũ:
   *   ❌ Cũ: gọi generateTokens(user) → userData chỉ có {id, email, role}
   *   ✅ Mới: gọi loginAndBuildResponse(user) → userData đầy đủ như register:
   *            id, email, passwordHash, role, status, isActive,
   *            failedLoginAttempts, lockedUntil, lastLoginAt, createdAt, updatedAt
   *   Một form đăng nhập: @student.tdtu.edu.vn → người học, @lecturer.tdtu.edu.vn → giảng viên.
   */
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: any,
    @Res({ passthrough: true }) response: Response,
  ) {
    const emailRaw = String(loginDto.email ?? '').trim();
    const emailLower = emailRaw.toLowerCase();
    const isAdminPortal = loginDto.portal === 'admin';

    // Bước 0: Cổng admin (/admin/login) — không ràng buộc domain; chỉ chấp nhận role ADMIN
    // Cổng LMS thống nhất — suy luồng từ domain (@gmail.com: dev / ngoại lệ)
    const domainGate = emailLower.endsWith('@student.tdtu.edu.vn')
      ? 'student'
      : emailLower.endsWith('@lecturer.tdtu.edu.vn')
        ? 'staff'
        : emailLower.endsWith('@gmail.com')
          ? 'gmail'
          : 'invalid';

    if (!isAdminPortal && domainGate === 'invalid') {
      throw new BadRequestException(
        'Email phải thuộc @student.tdtu.edu.vn (người học), @lecturer.tdtu.edu.vn (giảng viên) hoặc @gmail.com.',
      );
    }

    // Bước 1: validate credentials → trả về full User entity
    const user = await this.authService.validateUser(
      emailRaw,
      loginDto.password,
    );

    // Bước 2: Khớp domain (hoặc cổng admin) với role
    const isStudentRole = user.role === 'STUDENT';
    const isStaffRole = ['LECTURER', 'HEAD_OF_DEPARTMENT', 'ADMIN'].includes(
      user.role,
    );

    if (isAdminPortal) {
      if (user.role !== 'ADMIN') {
        throw new BadRequestException('Chỉ tài khoản quản trị được phép đăng nhập tại đây.');
      }
    } else {
      if (domainGate === 'student' && !isStudentRole) {
        throw new BadRequestException(
          'Tài khoản này không phải Người học. Hãy dùng email @student.tdtu.edu.vn đúng với tài khoản người học.',
        );
      }
      if (domainGate === 'staff' && !isStaffRole) {
        throw new BadRequestException(
          'Tài khoản này không phải Giảng viên - Viên chức. Hãy dùng email @lecturer.tdtu.edu.vn đúng với tài khoản giảng viên.',
        );
      }
      if (domainGate === 'gmail' && !isStudentRole && !isStaffRole) {
        throw new BadRequestException('Tài khoản không hợp lệ cho đăng nhập.');
      }
    }

    // Bước 3: build response đầy đủ (query thêm student.status bên trong)
    const { accessToken, refreshToken, message, data } =
      await this.authService.loginAndBuildResponse(user);

    // Bước 4: set refreshToken vào httpOnly cookie (middleware dùng để xác thực trang UI)
    response.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    // Bước 5: URL sau đăng nhập theo role
    const redirectUrl = isStudentRole
      ? '/student/profile'
      : user.role === 'ADMIN'
        ? '/admin'
        : '/staff';

    return { accessToken, message, data, redirectUrl };
  }

  /**
   * POST /api/v1/auth/refresh
   */
  @Post('refresh')
  async refreshToken(@Req() request: Request) {
    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException('Không tìm thấy token');
    }
    const refreshToken = authHeader.split(' ')[1];
    return this.authService.refresh(refreshToken);
  }

  /**
   * POST /api/v1/auth/forgot-password
   * Tạo token đặt lại mật khẩu có thời gian hiệu lực.
   */
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto.email);
  }

  /**
   * POST /api/v1/auth/reset-password
   * Đặt lại mật khẩu bằng reset token.
   */
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(@Body() dto: ResetPasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp.');
    }
    return this.authService.resetPassword(dto.token, dto.newPassword);
  }

  /**
   * PATCH /api/v1/auth/change-password
   * Người dùng đã đăng nhập tự đổi mật khẩu.
   */
  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async changePassword(@Req() req: any, @Body() dto: ChangePasswordDto) {
    if (dto.newPassword !== dto.confirmPassword) {
      throw new BadRequestException('Mật khẩu xác nhận không khớp.');
    }

    return this.authService.changePassword(
      Number(req.user.id),
      dto.currentPassword,
      dto.newPassword,
    );
  }

  /**
   * GET /api/v1/auth/logout
   * Xóa refreshToken cookie → người dùng sẽ bị đá ra khỏi trang nội bộ
   */
  @Get('logout')
  logout(@Res() response: Response) {
    // Xóa cookie refreshToken
    (response as any).clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });
    
    // Redirect về trang gốc (http://localhost:3001/)
    return (response as any).redirect('/');
  }
}
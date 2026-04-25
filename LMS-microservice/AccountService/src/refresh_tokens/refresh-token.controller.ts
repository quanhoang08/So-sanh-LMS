// src/refresh_tokens/refresh-token.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RefreshTokenService } from './refresh-token.service';
import { TokenRequestDto } from './refresh-token.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators';

/**
 * RefreshTokenController - Handle token refresh and logout operations
 */
@Controller('auth')
export class RefreshTokenController {
  constructor(private readonly refreshTokenService: RefreshTokenService) {
    console.log('✅ RefreshTokenController initialized');
  }

  /**
   * POST /api/v1/auth/refresh
   * Refresh access token using refresh token
   * Public endpoint
   */
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshAccessToken(@Body() dto: TokenRequestDto) {
    console.log('🔄 [RefreshToken] Refreshing access token');

    // 1. Validate refresh token
    const validTokenRecord = await this.refreshTokenService.validateRefreshToken(
      dto.refreshToken
    );

    // 2. Generate new access token
    const result = await this.refreshTokenService.refreshAccessToken(
      dto.refreshToken
    );

    return {
      message: 'Token hợp lệ. Đã cấp phát Access Token mới.',
      data: {
        accessToken: result.accessToken,
        expiresIn: result.expiresIn,
        user: {
          id: validTokenRecord.user.id,
          email: validTokenRecord.user.email,
          role: validTokenRecord.user.role,
        },
      },
    };
  }

  /**
   * POST /api/v1/auth/logout
   * Revoke single refresh token (logout from one device)
   * Public endpoint - provide the refresh token to revoke
   */
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: TokenRequestDto) {
    console.log('🔒 [RefreshToken] Single logout');

    // Extract user ID from token before revoking
    const validToken = await this.refreshTokenService.validateRefreshToken(
      dto.refreshToken
    );
    const tokenId = validToken.id;

    // Revoke the token
    await this.refreshTokenService.revokeToken(tokenId);

    return {
      message: 'Đăng xuất thành công. Phiên làm việc đã bị hủy.',
    };
  }

  /**
   * POST /api/v1/auth/logout-all
   * Revoke all refresh tokens for user (logout from all devices)
   * Protected endpoint - requires valid JWT
   */
  @Post('logout-all')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logoutAllDevices(@CurrentUser('id') userId: number) {
    console.log('🔒 [RefreshToken] Logout all devices for user:', userId);

    // Revoke all tokens for this user
    await this.refreshTokenService.revokeAllUserTokens(userId);

    return {
      message: 'Đã đăng xuất khỏi tất cả các thiết bị.',
    };
  }
}
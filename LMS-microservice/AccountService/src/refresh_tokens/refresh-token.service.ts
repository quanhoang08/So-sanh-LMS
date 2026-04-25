// src/refresh_tokens/refresh-token.service.ts
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenRepository } from './refresh-token.repository';
import { UserService } from '../user/user.service';
import { RefreshToken } from './refresh-token.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class RefreshTokenService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,

    @InjectRepository(RefreshToken)
    private refreshTokenRepository: RefreshTokenRepository,

    private userService: UserService,
  ) {
    console.log('✅ RefreshTokenService initialized');
  }

  /**
   * Tạo refresh token mới
   */
  async generateRefreshToken(
    userId: number,
  ): Promise<{ token: string; expiresAt: Date }> {
    try {
      // Get user
      const user = await this.userService.findOne(userId);
      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Lấy refresh token expiry từ config (mặc định 7 days)
      const refreshTokenExpiry =
        this.configService.get<string>('REFRESH_TOKEN_EXPIRES_IN') || '7d';

      // Calculate expiry date
      const expiryMs = this.parseExpiry(refreshTokenExpiry);
      const expiresAt = new Date(Date.now() + expiryMs);

      // Generate JWT refresh token
      // ✅ FIX: Only pass expiresIn in options (secret is from JwtModule config)
      const token = this.jwtService.sign(
        { sub: userId, type: 'refresh' } as any,
        {
          expiresIn: refreshTokenExpiry,
        }  as any
      );

      // Save to database
      const refreshToken = await this.refreshTokenRepository.createRefreshToken(
        user,
        token,
        expiresAt,
      );

      // Clean up old tokens (keep only 5 most recent)
      await this.refreshTokenRepository.deleteOldTokens(userId, 5);

      console.log('🆕 [RefreshToken] Generated for user:', userId);

      return {
        token: refreshToken.token,
        expiresAt: refreshToken.expiresAt,
      };
    } catch (error: any) {
      console.error('❌ [RefreshToken] Error generating token:', error);
      throw new BadRequestException('Failed to generate refresh token');
    }
  }

  /**
   * Xác thực refresh token
   */
  async validateRefreshToken(token: string): Promise<RefreshToken> {
    try {
      // Xác thực JWT signature
      // ✅ FIX: Only need token, JwtModule is already configured
      const payload = this.jwtService.verify(token);

      // Kiểm tra trong database
      const refreshToken = await this.refreshTokenRepository.findValidToken(token);

      if (!refreshToken) {
        throw new UnauthorizedException('Refresh token is invalid or expired');
      }

      return refreshToken;
    } catch (error: any) {
      console.error('❌ [RefreshToken] Validation failed:', error.message);
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  /**
   * Refresh access token bằng refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    expiresIn: number;
  }> {
    try {
      // Xác thực refresh token
      const validToken = await this.validateRefreshToken(refreshToken);

      // Lấy user info từ payload
      const payload = this.jwtService.decode(refreshToken) as any;
      const userId = payload.sub;

      // Generate new access token
      const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN') || '1d';
      
      // ✅ FIX: Only pass expiresIn in options
      const accessToken = this.jwtService.sign(
        { sub: userId, type: 'access' } as any,
        { expiresIn } as any
      );

      console.log('🔄 [RefreshToken] Access token refreshed for user:', userId);

      return {
        accessToken,
        expiresIn: this.parseExpiry(expiresIn) / 1000, // Convert to seconds
      };
    } catch (error: any) {
      console.error('❌ [RefreshToken] Refresh failed:', error.message);
      throw error;
    }
  }

  /**
   * Revoke single refresh token
   */
  async revokeToken(tokenId: number): Promise<RefreshToken | null> {
    try {
      const revokedToken = await this.refreshTokenRepository.revokeToken(tokenId);

      console.log('🔒 [RefreshToken] Token revoked:', tokenId);

      return revokedToken;
    } catch (error: any) {
      console.error('❌ [RefreshToken] Revoke failed:', error);
      throw new BadRequestException('Failed to revoke token');
    }
  }

  /**
   * Revoke tất cả refresh token của user (logout all devices)
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    try {
      await this.refreshTokenRepository.revokeAllUserTokens(userId);

      console.log('🔒 [RefreshToken] All tokens revoked for user:', userId);
    } catch (error: any) {
      console.error('❌ [RefreshToken] Revoke all failed:', error);
      throw new BadRequestException('Failed to revoke all tokens');
    }
  }

  /**
   * Xóa refresh token hết hạn (cleanup task)
   */
  async deleteExpiredTokens(): Promise<void> {
    try {
      await this.refreshTokenRepository.deleteExpiredTokens();
      console.log('🧹 [RefreshToken] Expired tokens deleted');
    } catch (error: any) {
      console.error('❌ [RefreshToken] Cleanup failed:', error);
    }
  }

  /**
   * Lấy danh sách refresh token của user
   */
  async getUserTokens(userId: number): Promise<RefreshToken[]> {
    try {
      return await this.refreshTokenRepository.findByUserId(userId);
    } catch (error: any) {
      console.error('❌ [RefreshToken] Get tokens failed:', error);
      throw new BadRequestException('Failed to fetch tokens');
    }
  }

  /**
   * Lấy thống kê refresh token của user
   */
  async getTokenStats(userId: number): Promise<any> {
    try {
      return await this.refreshTokenRepository.getTokenStats(userId);
    } catch (error: any) {
      console.error('❌ [RefreshToken] Get stats failed:', error);
      throw new BadRequestException('Failed to fetch token stats');
    }
  }

  /**
   * Helper: Parse expiry string (e.g., '7d', '24h') to milliseconds
   */
  private parseExpiry(expiry: string): number {
    const units: Record<string, number> = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    const match = expiry.match(/^(\d+)([a-z]+)$/);
    if (!match) {
      return 7 * 24 * 60 * 60 * 1000; // Default 7 days
    }

    const [, value, unit] = match;
    return parseInt(value) * (units[unit] || 1);
  }
}
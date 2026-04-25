// src/refresh_tokens/repositories/refresh-token.repository.ts
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { RefreshToken } from './refresh-token.entity';

@Injectable()
export class RefreshTokenRepository extends Repository<RefreshToken> {
  constructor(private dataSource: DataSource) {
    super(RefreshToken, dataSource.createEntityManager());
  }

  /**
   * Tìm refresh token bằng token string
   */
  async findByToken(token: string): Promise<RefreshToken | null> {
    return this.findOne({
      where: { token },
      relations: ['user'],
    });
  }

  /**
   * Tìm refresh token bằng user ID
   */
  async findByUserId(userId: number): Promise<RefreshToken[]> {
    return this.find({
      where: { user: { id: userId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Tìm refresh token hợp lệ (chưa hết hạn, chưa revoked)
   */
  async findValidToken(token: string): Promise<RefreshToken | null> {
    const refreshToken = await this.findByToken(token);
    
    if (!refreshToken || refreshToken.isRevoked) {
      return null;
    }

    if (refreshToken.isExpired()) {
      // Auto-delete expired tokens
      await this.delete(refreshToken.id);
      return null;
    }

    return refreshToken;
  }

  /**
   * Tạo refresh token mới
   */
  async createRefreshToken(
    user: any,
    token: string,
    expiresAt: Date,
  ): Promise<RefreshToken> {
    const refreshToken = this.create({
      user,
      token,
      expiresAt,
      isRevoked: false,
    });

    return this.save(refreshToken);
  }

  /**
   * Revoke refresh token
   */
  async revokeToken(id: number): Promise<RefreshToken | null> {
    await this.update(id, {
      isRevoked: true,
    });

    return this.findOne({ where: { id } });
  }

  /**
   * Revoke tất cả refresh token của user (logout all devices)
   */
  async revokeAllUserTokens(userId: number): Promise<void> {
    await this.update(
      { user: { id: userId }, isRevoked: false },
      {
        isRevoked: true,
      }
    );
  }

  /**
   * Xóa refresh token hết hạn (cleanup task)
   */
  async deleteExpiredTokens(): Promise<void> {
    const now = new Date();
    await this.createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now })
      .execute();
  }

  /**
   * Lấy thống kê refresh token
   */
  async getTokenStats(userId: number): Promise<{
    totalTokens: number;
    activeTokens: number;
    revokedTokens: number;
  }> {
    const tokens = await this.findByUserId(userId);

    return {
      totalTokens: tokens.length,
      activeTokens: tokens.filter(t => !t.isRevoked && !t.isExpired()).length,
      revokedTokens: tokens.filter(t => t.isRevoked).length,
    };
  }

  /**
   * Xóa token cũ (giữ lại chỉ 5 tokens mới nhất per user)
   */
  async deleteOldTokens(userId: number, keepCount: number = 5): Promise<void> {
    const tokens = await this.findByUserId(userId);

    if (tokens.length > keepCount) {
      const tokensToDelete = tokens.slice(keepCount);
      const ids = tokensToDelete.map(t => t.id);
      
      if (ids.length > 0) {
        await this.delete(ids);
      }
    }
  }
}
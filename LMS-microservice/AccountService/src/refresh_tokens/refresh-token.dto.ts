// src/refresh_tokens/dto/refresh-token.dto.ts
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

/**
 * Request DTO for refresh token operations
 */
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken!: string;
}

/**
 * Alias for RefreshTokenDto (for controller compatibility)
 */
export class TokenRequestDto extends RefreshTokenDto {}

/**
 * DTO for revoking tokens
 */
export class RevokeTokenDto {
  @IsString()
  @IsOptional()
  reason?: string;
}

/**
 * Response DTO for refresh token details
 */
export class RefreshTokenResponseDto {
  id!: number;  // Changed from string to number (matches entity)
  expiresAt!: Date;
  isRevoked!: boolean;
  createdAt!: Date;
}

/**
 * Response DTO for token refresh operation
 */
export class TokenRefreshResponseDto {
  accessToken!: string;
  expiresIn!: number;
  refreshToken?: string; // Optionally rotate refresh token
}
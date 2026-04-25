// src/common/decorators/roles.decorator.ts
import { SetMetadata } from '@nestjs/common';

/**
 * Roles Decorator - Mark endpoint with required roles
 * 
 * Usage:
 *   @Roles(UserRole.ADMIN)
 *   @Roles(UserRole.ADMIN, UserRole.LECTURER)
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
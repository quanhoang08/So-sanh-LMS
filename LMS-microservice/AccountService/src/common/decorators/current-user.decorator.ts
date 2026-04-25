// src/common/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * CurrentUser Decorator - Extract user info from JWT payload
 * 
 * Usage in controllers:
 *   @CurrentUser() user: any              // Full user object
 *   @CurrentUser('id') userId: string     // Just ID
 *   @CurrentUser('email') email: string   // Just email
 *   @CurrentUser('role') role: string     // Just role
 */
export const CurrentUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // If no data key specified, return full user object
    if (!data) {
      return user;
    }

    // Return specific field from user
    return user[data];
  },
);
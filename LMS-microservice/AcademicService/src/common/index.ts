// src/common/index.ts
/**
 * Common module exports
 * Re-export all utilities for cleaner imports
 */

// Filters
export { HttpExceptionFilter } from './filters/http-exception.filter';

// Interceptors
export { LoggingInterceptor } from './interceptors/logging.interceptor';

// Decorators
export { CurrentUser} from './decorators/current-user.decorator';
export {  Roles } from './decorators/role.decorator';

// Enums
export { UserRole } from './enums/user-role.enum';

// Module
export { CommonModule } from './common.module';
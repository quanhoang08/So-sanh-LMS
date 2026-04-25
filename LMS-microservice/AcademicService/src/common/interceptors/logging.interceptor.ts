// src/common/interceptors/logging.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  Logger,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, ip } = request;
    const userAgent = request.get('user-agent');
    const startTime = Date.now();

    // Log incoming request
    this.logger.log(
      `[${method}] ${url} - IP: ${ip} - User Agent: ${userAgent}`
    );

    return next.handle().pipe(
      tap({
        next: (data: any) => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          // Log successful response
          this.logger.log(
            `[${method}] ${url} - ${statusCode} - ${duration}ms`
          );
        },
        error: (error: any) => {
          const duration = Date.now() - startTime;
          const statusCode = error.status || response.statusCode || 500;

          // Log error response
          this.logger.error(
            `[${method}] ${url} - ${statusCode} - ${duration}ms - Error: ${error.message}`
          );
        },
      })
    );
  }
}
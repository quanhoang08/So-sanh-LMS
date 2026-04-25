// src/common/filters/http-exception.filter.ts
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract error details
    let errorMessage = exception.message;
    let validationErrors = null;

    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      const response = exceptionResponse as any;
      errorMessage = response.message || errorMessage;
      validationErrors = response.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: errorMessage,
      error: status >= 500 ? 'Internal Server Error' : exceptionResponse,
      ...(validationErrors ? { validationErrors } : {}),
    };

    // Log error
    if (status >= 500) {
      this.logger.error(
        `HTTP ${status} - ${request.method} ${request.url}`,
        exception.stack
      );
    } else {
      this.logger.warn(
        `HTTP ${status} - ${request.method} ${request.url} - ${errorMessage}`
      );
    }

    response.status(status).json(errorResponse);
  }
}
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import chalk from 'chalk';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const requestId = uuidv4();
    const method = request.method;
    const url = request.url;
    const ip = request.ip ?? 'Unknown';
    const time = new Date().toISOString();
    const stack = exception.stack?.split('\n').slice(0, 4).join('\n') || 'No stack trace';

    // 🚀 BÓC TÁCH LỖI CHI TIẾT TỪ CLASS-VALIDATOR
    const exceptionResponse: any = exception.getResponse();
    
    // Nếu là lỗi validate, nó sẽ trả về mảng (Array). Nếu lỗi thường, nó là chuỗi (String)
    const detailedMessage = exceptionResponse.message || exception.message;
    
    // Gộp mảng lại thành chuỗi để log ra Terminal Backend cho gọn
    const cause = Array.isArray(detailedMessage) 
      ? detailedMessage.join(', ') 
      : detailedMessage;

    // Log error (giữ nguyên format bảng của bạn)
    console.log(chalk.red(`\n--- ❌ ERROR [ID: ${requestId}] ---`));
    console.log(chalk.red(`| Status   | ${status}`));
    console.log(chalk.red(`| Method   | ${method.padEnd(10)}`));
    console.log(chalk.red(`| URL      | ${url.padEnd(10)}`));
    console.log(chalk.red(`| IP       | ${ip.padEnd(10)}`));
    console.log(chalk.red(`| Time     | ${time.padEnd(10)}`));
    console.log(chalk.red(`| Cause    | ${cause.padEnd(10)}`)); // 👈 Giờ console sẽ in ra chi tiết lỗi
    console.log(chalk.red(`| Location | From stack trace:`));
    console.log(chalk.red(stack));  
    console.log(chalk.red(`--- ❌ ERROR END [ID: ${requestId}] ---\n`));

    // 🚀 RESPONSE VỀ CLIENT: Trả về cục detailedMessage (chứa mảng lỗi gốc)
    response.status(status).json({
      statusCode: status,
      timestamp: time,
      path: url,
      message: detailedMessage, // 👈 Frontend sẽ nhận được mảng này!
    });
  }
}
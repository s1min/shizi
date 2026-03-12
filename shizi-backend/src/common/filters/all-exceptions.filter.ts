import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message =
        typeof res === 'string'
          ? res
          : (res as any).message || exception.message;
      // 如果 message 是数组（class-validator），拼接为字符串
      if (Array.isArray(message)) {
        message = message.join('; ');
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // 非 4xx 错误打印完整堆栈
    if (status >= 500) {
      this.logger.error(
        `${status} ${message}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    } else {
      this.logger.warn(`${status} ${message}`);
    }

    response.status(status).json({
      code: status,
      data: null,
      message,
    });
  }
}

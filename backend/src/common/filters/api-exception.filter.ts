import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  message?: string | string[];
  error?: string;
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      error: this.getErrorMessage(exception),
    });
  }

  private getErrorMessage(exception: unknown): string {
    if (!(exception instanceof HttpException)) {
      return 'Внутренняя ошибка сервера';
    }

    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    const errorResponse = response as ErrorResponse;

    if (Array.isArray(errorResponse.message)) {
      return errorResponse.message.join('; ');
    }

    return errorResponse.message ?? errorResponse.error ?? exception.message;
  }
}

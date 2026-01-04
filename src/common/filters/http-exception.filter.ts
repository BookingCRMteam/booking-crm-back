import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
interface ExceptionResponse {
  message: string;
  error: string;
}
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message =
      (exceptionResponse as ExceptionResponse).message || exception.message;

    if (
      typeof message === 'string' &&
      message.startsWith('Unexpected field - ')
    ) {
      const fieldName = message.split(' - ')[1];
      message = `Maximum number of files exceeded for field '${fieldName}'. Please reduce the number of files and try again.`;
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: (exceptionResponse as ExceptionResponse).error || 'Http Exception',
    });
  }
}

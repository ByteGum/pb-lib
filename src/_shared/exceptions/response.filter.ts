import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { MongoError } from 'mongodb';
import AppException from './app-exception';

@Catch()
export class ResponseFilter implements ExceptionFilter {
  public catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const meta: any = {};
    if (
      exception instanceof AppException ||
      exception instanceof HttpException
    ) {
      meta.statusCode = exception.getStatus();
      meta.error = exception.getResponse();
    } else if (exception instanceof MongoError) {
      const code = HttpStatus.FAILED_DEPENDENCY;
      meta.statusCode = code;
      meta.error = {
        code,
        message: 'Some setup problems with datastore, please try again',
      };
      meta.developer_message = exception.message;
    } else if (exception instanceof Error) {
      const code = HttpStatus.INTERNAL_SERVER_ERROR;
      meta.statusCode = code;
      meta.error = { code, message: exception.message };
      meta.developer_message = exception;
    } else {
      const code = HttpStatus.INTERNAL_SERVER_ERROR;
      meta.statusCode = code;
      meta.error = {
        code: code,
        message: 'A problem with our server, please try again later',
      };
      meta.developer_message = exception;
    }
    response.status(meta.statusCode).json({ meta });
  }
}

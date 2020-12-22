import { HttpStatus } from '@nestjs/common';
import AppException from './app-exception';

export class ErrorException extends AppException {
  constructor(
    message: string,
    status: number,
    protected objectOrError?: string | any,
  ) {
    super(message, status, 0, objectOrError);
  }

  getStatus(): number {
    return HttpStatus.BAD_REQUEST;
  }

  getResponse(): object {
    const obj: any = { code: this.getStatus() || 500, message: this.message };
    if (this.objectOrError) {
      obj.messages = this.objectOrError;
    }
    return obj;
  }
}

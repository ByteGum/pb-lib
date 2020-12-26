import { HttpStatus } from '@nestjs/common';
import { AppException } from './app-exception';
import { AppStatus } from '../common';

export class WorkerException extends AppException {
  constructor(
    err: any,
    status: number = HttpStatus.INTERNAL_SERVER_ERROR,
    code: number = AppStatus.WORKER_ERROR,
    message = 'Worker Exception',
  ) {
    super(err, code, status, message);
  }
}

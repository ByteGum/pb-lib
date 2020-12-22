import { HttpStatus } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';

export default class AppException extends HttpException {
  private errorCode: number;

  constructor(error: any, status: number, code = -1, message: string = null) {
    const customMsg = typeof error === 'string' ? error : message;
    super(customMsg, status);
    this.errorCode = code;
  }

  public static get CANNOT_PERFORM_OPERATION() {
    return new this(
      'Cannot perform operation',
      HttpStatus.UNAUTHORIZED,
    );
  }

  public static get NOT_FOUND() {
    return new this('Resource not found', HttpStatus.NOT_FOUND);
  }

  public static get SERVER_ERROR() {
    return new this(
      'Error in setup interaction',
      HttpStatus.INTERNAL_SERVER_ERROR,
    );
  }

  getResponse() {
    const response: any = {
      code: this.getStatus() || 500,
      message: this.message,
    };
    if (this.message) {
      response.message = this.message;
    }
    return response;
  }

  /**
   * @param {Number} statusCode the meta object
   * @return {Object} The success response object
   */
  getMeta(statusCode = null) {
    return {
      statusCode: statusCode || this.getStatus(),
      errorCode: this.errorCode,
      success:
        this.getStatus() >= HttpStatus.OK &&
        this.getStatus() <= HttpStatus.PARTIAL_CONTENT,
    };
  }
}

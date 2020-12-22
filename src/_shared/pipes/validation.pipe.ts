import { ArgumentMetadata, HttpStatus, Injectable, PipeTransform } from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { ErrorException } from '../exceptions/validation';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const formatted = ValidationPipe.formatErrors(errors);
      throw new ErrorException(
        'Bad request / Validation error',
        HttpStatus.BAD_REQUEST,
        formatted,
      );
    }
    return value;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  static formatErrors(errors: ValidationError[]) {
    const formatted = {};
    const getNestedErrors = (error) => {
      if (error.children.length === 0) {
        return error.constraints;
      } else {
        return this.formatErrors(error.children);
      }
    };
    errors.forEach((error) => {
      formatted[error.property] = getNestedErrors(error);
    });
    return formatted;
  }

  public static VALIDATION_ERROR(errors) {
    return new ErrorException(
      'Bad request / Validation error',
      HttpStatus.BAD_REQUEST,
      errors,
    );
  }
}

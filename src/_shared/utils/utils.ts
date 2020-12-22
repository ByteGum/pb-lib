import * as crypto from 'crypto';
import * as _ from 'lodash';
import pickKeys from 'json-pick-keys';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { HttpException, HttpStatus } from '@nestjs/common';
import * as moment from 'moment-timezone';
import * as IdGenerator from 'auth0-id-generator';

export class Utils {
  public static generateRandomNumber(length): number {
    // Generate a random {length} digit code
    return Math.floor(
      Math.pow(10, length - 1) + Math.random() * Math.pow(10, length - 1) * 9,
    );
  }

  public static generateRandomID(length): string {
    return crypto.randomBytes(length / 2).toString('hex');
  }

  /**
   * @param {Number} hour
   * @return {Date} The date
   */
  public static addHourToDate(hour = 1) {
    const date = new Date();
    const hours = date.getHours() + hour;
    date.setHours(hours);
    return date;
  }

  public static toSlug(value: string) {
    return _.kebabCase(value);
  }

  public static toSentenceCase(str) {
    return _.upperFirst(str);
  }

  public static toTitleCase(str: string) {
    return _.upperFirst(str.toLowerCase());
  }

  /**
   * Removes all Nil values from object - undefined, null
   *
   * @param {Object} obj
   * @return {object}
   */
  public static removeNilValues(obj: object): any {
    return _.omitBy(obj, _.isNil);
  }

  /**
   * Select a space seperated keys from an object
   *
   * @param {object} obj
   * @param {string} spaceSeparatedKeys
   * @return {any}
   */
  public static selectKeys(obj: object, spaceSeparatedKeys: string) {
    const keyArray = spaceSeparatedKeys.trim().split(' ');

    return _.pickBy(obj, (value, key) => {
      return _.includes(keyArray, key);
    });
  }

  public static pickKeys<T = any>(obj: T, spaceSeparatedKeys: string) {
    return pickKeys(obj, spaceSeparatedKeys) as T;
  }

  public static enumToArray(_enum) {
    const enumsArray = [];
    for (const prop of Object.keys(_enum)) {
      enumsArray.push(_enum[prop]);
    }
    return enumsArray;
  }

  static async ensureParams(metatype, value, exception?: HttpException) {
    const object = plainToClass(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      throw exception
        ? exception
        : new HttpException(
          `$${errors[0].property} Validation failed`,
          HttpStatus.BAD_REQUEST,
        );
    }
    return value;
  }

  static async deepMerge(obj, ...sources) {
    return _.merge(obj, ...sources);
  }

  static removeNonAlphanumeric(str: string) {
    return str.replace(/\W/g, '');
  }

  static daysBetween(date1, date2) {
    // Get difference in seconds
    const differenceInSeconds = Utils.secondsBetween(date1, date2);

    // Convert back to days and return by dividing my seconds in a day (60 * 60 * 24)
    return Math.round(differenceInSeconds / 86400);
  }

  static secondsBetween(date1, date2) {
    const moment1 = moment(date1),
      moment2 = moment(date2);

    return Math.round(moment1.diff(moment2) / 1000);
  }

  /**
   * @param {String} key the prefix for the id
   * @param {Number} length the length of the id
   * @return {Date} The date
   */
  static generateUniqueId(key: string, length = 12) {
    const generator = new IdGenerator();
    return generator.new(key);
  }
}

import { ConfigService } from '@nestjs/config';
import { Body, Delete, Get, HttpCode, HttpStatus, Next, Param, Patch, Post, Put, Req, Res } from '@nestjs/common';
import { BaseService } from './base.service';
import { Document } from 'mongoose';
import * as _ from 'lodash';
import { NextFunction } from 'express';
import { AppException } from '../exceptions/app-exception';
import { Pagination, QueryParser } from '../common';

export class BaseController<T extends Document> {
  protected lang: any = {
    get: (key = 'data') => {
      return {
        created: 'Data successfully created',
        updated: 'Data successfully updated',
        deleted: 'Data successfully deleted',
        not_found: 'Data not found',
      };
    },
  };

  constructor(
    protected config: ConfigService,
    protected service: BaseService<T>,
  ) {
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  public async create(
    @Body() payload: any,
    @Res() res,
    @Req() req,
    @Next() next: NextFunction,
  ) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      if (!this.service.routes.create) {
        next(AppException.NOT_FOUND);
      }
      let value = await this.service.retrieveExistingResource(payload);
      if (value) {
        const returnIfFound = this.service.Model.config().returnDuplicate;
        if (!returnIfFound) {
          const messageObj = this.service.Model.config().uniques.map(m => ({ [m]: `${m} must be unique` }));
          const appError = new AppException('Duplicate record is not allowed', HttpStatus.CONFLICT, messageObj);
          return next(appError);
        }
      } else {
        let checkError = await this.service.validateCreate(payload);
        if (checkError) {
          return next(checkError);
        }
        value = await this.service.createNewObject({
          ...payload,
          auth: req.auth,
        });
      }
      const response = await this.service.getResponse({
        queryParser,
        value,
        code: HttpStatus.CREATED,
        message: this.lang.get(this.service.modelName).created,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (e) {
      next(e);
    }
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  public async find(@Req() req, @Res() res, @Next() next: NextFunction) {
    const queryParser = new QueryParser(Object.assign({}, req.query));
    const pagination = new Pagination(req.originalUrl, this.service.baseUrl,
      this.service.itemsPerPage);
    try {
      const { value, count } = await this.service.buildModelQueryObject(
        pagination,
        queryParser,
      );
      const response = await this.service.getResponse({
        code: HttpStatus.OK,
        value,
        count,
        queryParser,
        pagination,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  public async findOne(@Param('id') id: string, @Req() req, @Res() res, @Next() next: NextFunction) {
    try {
      const queryParser = new QueryParser(Object.assign({}, req.query));
      const object = await this.service.findObject(id, queryParser);
      const response = await this.service.getResponse({
        queryParser,
        code: HttpStatus.OK,
        value: object,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  public async patch(
    @Param('id') id: string,
    @Body() payload: any,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      if (!this.service.routes.patch) {
        throw AppException.NOT_FOUND;
      }
      const queryParser = new QueryParser(Object.assign({}, req.query));
      let object = await this.service.findObject(id, queryParser);
      object = await this.service.patchUpdate(object, {
        ...payload,
        auth: req.auth,
      });
      const canUpdateError = await this.service.validateUpdate(object, {
        ...payload,
        auth: req.auth,
      });
      if (!_.isEmpty(canUpdateError)) {
        throw canUpdateError;
      }
      const response = await this.service.getResponse({
        queryParser,
        code: HttpStatus.OK,
        value: object,
        message: this.lang.get(this.service.modelName).updated,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      return next(err);
    }
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('id') id: string,
    @Body() payload: any,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction,
  ) {
    try {
      if (!this.service.routes.update) {
        throw AppException.NOT_FOUND;
      }
      const queryParser = new QueryParser(Object.assign({}, req.query));
      let object = await this.service.findObject(id, queryParser);
      const canUpdateError = await this.service.validateUpdate(object, {
        ...payload,
        auth: req.auth,
      });
      if (!_.isEmpty(canUpdateError)) {
        throw canUpdateError;
      }
      object = await this.service.updateObject(id, payload);
      const response = await this.service.getResponse({
        queryParser,
        code: HttpStatus.OK,
        value: object,
        message: this.lang.get(this.service.modelName).deleted,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }

  @Delete('/:id')
  @HttpCode(HttpStatus.OK)
  public async remove(@Param('id') id: string, @Req() req, @Res() res, @Next() next: NextFunction) {
    try {
      if (!this.service.routes.remove) {
        throw AppException.NOT_FOUND;
      }
      let object = await this.service.findObject(id);
      const canDeleteError = await this.service.validateDelete(object);
      if (!_.isEmpty(canDeleteError)) {
        throw canDeleteError;
      }
      object = await this.service.deleteObject(object);
      const response = await this.service.getResponse({
        code: HttpStatus.OK,
        value: { _id: object._id },
        message: this.lang.get(this.service.modelName).deleted,
      });
      return res.status(HttpStatus.OK).json(response);
    } catch (err) {
      next(err);
    }
  }
}

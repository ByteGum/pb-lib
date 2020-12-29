import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Next,
  Param,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TodoService } from '../todo.service';
import { Todo, TodoDocument } from '../entity/todo.entity';
import { UpdateTodoDto } from '../../dto/UpdateTodoDto';
import { CreateTodoDto } from '../../dto/CreateTodoDto';
import { NextFunction } from 'express';
import { BaseController } from '../../../_shared/_base';
import { JwtAuthGuard } from '../../../_shared/guards';

@Controller('todos')
export class TodoController extends BaseController<TodoDocument> {
  constructor(protected service: TodoService, protected config: ConfigService) {
    super(config, service);
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  public async create(@Body() payload: CreateTodoDto, @Res() res, @Req() req, @Next() next: NextFunction) {
    super.create(payload, res, req, next);
  }

  @Put('/:id')
  @HttpCode(HttpStatus.OK)
  public async update(
    @Param('id') id: string,
    @Body() payload: UpdateTodoDto,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction
  ) {
    super.update(id, payload, req, res, next);
  }

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  public async patch(
    @Param('id') id: string,
    @Body() payload: UpdateTodoDto,
    @Req() req,
    @Res() res,
    @Next() next: NextFunction
  ) {
    super.patch(id, payload, req, res,  next);
  }
}

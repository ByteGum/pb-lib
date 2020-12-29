import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { Todo, TodoDocument } from './entity/todo.entity';
import { BaseService } from '../../_shared';

@Injectable()
export class TodoService extends BaseService<TodoDocument> {
  constructor(
    @InjectModel(Todo.name) protected model: Model<TodoDocument>,
    protected config: ConfigService,
  ) {
    super(model);
  }
}

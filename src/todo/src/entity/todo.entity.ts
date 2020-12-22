import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { BaseEntity } from '../../../_shared';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true, autoCreate: true })
export class Todo extends BaseEntity {
  protected fillables = ['title', 'description'];
  protected updateFillables = ['title', 'description', 'active'];
  public iDToken = 'tod';

  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  publicId: string;

  @Prop({
    type: String,
    required: true,
    unique: true,
  })
  title: string;

  @Prop({
    type: String,
  })
  description: string;

  @Prop({
    type: Boolean,
    default: true,
  })
  active: boolean;

  @Prop({
    type: Boolean,
    default: false,
    select: false,
  })
  deleted: boolean;

  public searchQuery(q) {
    const regex = new RegExp(q);
    return [
      { title: { $regex: regex, $options: 'i' } },
      { description: { $regex: regex, $options: 'i' } },
    ];
  }
}

export const TodoSchema = SchemaFactory.createForClass(Todo);

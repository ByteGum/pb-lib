import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TodoDocument = Todo & Document;

@Schema({ timestamps: true, autoCreate: true })
export class Todo {

  @Prop({
    type: String,
    unique: true,
    required: true,
  })
  publicId: string;

  @Prop({
    type: String,
    required: true,
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

  static searchQuery(q) {
    const regex = new RegExp(q);
    return [
      { title: { $regex: regex, $options: 'i' } },
      { description: { $regex: regex, $options: 'i' } },
    ];
  }
}

let TodoSchema: any = SchemaFactory.createForClass(Todo);

// TodoSchema.statics.iDToken = 'tod';
TodoSchema.statics.config = () => {
  return {
    iDToken: 'tdd',
    softDelete: true,
    fillables: ['title', 'description'],
    hiddenFields: ['deleted'],
  }
};

TodoSchema.statics.searchQuery = (q) => {
  const regex = new RegExp(q);
  return [
    { title: { $regex: regex, $options: 'i' } },
    { description: { $regex: regex, $options: 'i' } },
  ];
};

export {
  TodoSchema,
};

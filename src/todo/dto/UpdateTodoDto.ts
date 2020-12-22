import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTodoDto {
  @ApiProperty({ example: 'Task 1' })
  @Transform(s => s.trim().toLowerCase())
  title: string;

  @ApiProperty({ example: 'The todo description' })
  description: string;
}

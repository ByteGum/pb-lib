import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailDto {
  @ApiProperty({ example: 'example@test.com' })
  @IsEmail()
  @IsNotEmpty()
  @Transform((s) => s.trim().toLowerCase())
  readonly email: string;
}

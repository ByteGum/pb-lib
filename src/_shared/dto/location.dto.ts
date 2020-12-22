import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LocationDto {
  @ApiProperty({ example: '10 crecent avenue ikeja' })
  @IsString()
  readonly street: string;

  @ApiProperty({ example: 'Off ahmad road' })
  @IsString()
  @IsOptional()
  readonly street2: string;

  @ApiProperty({ example: 'Isolo' })
  @IsString()
  readonly city: string;

  @ApiProperty({ example: 'Lagos' })
  @IsString()
  readonly state: string;

  @ApiProperty({ example: 'NG' })
  @IsString()
  @IsOptional()
  readonly country: string = 'NG';

  @ApiProperty({ example: '200020' })
  @IsString()
  @IsOptional()
  readonly postalCode: string;

  @ApiProperty({ example: '[0.020200202, 0.022030303]' })
  @IsString()
  @IsOptional()
  readonly coordinates: number[];
}

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreatePermissionDto {
  @ApiProperty({
    example: 'USER_CREATE',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    example: 'users',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  module: string;

  @ApiProperty({
    example: 'create',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  action: string;

  @ApiPropertyOptional({
    example: 'Allows creating users',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  description?: string;
}
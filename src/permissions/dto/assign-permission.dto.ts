import {
  ArrayNotEmpty,
  IsArray,
  IsUUID,
} from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class AssignPermissionsDto {
  @ApiProperty({
    example: [
      '9bb2df89-f2b2-4db8-86f3-327e77d54b1d',
      '6c41e0fc-59fb-4387-b4b2-4a5df5f6b452',
    ],
    description: 'List of Permission IDs',
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  permissionIds: string[];
}
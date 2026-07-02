import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { PermissionsService } from './permissions.service';

@ApiTags('Permissions')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly permissionsService: PermissionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new permission',
  })
  @ApiResponse({
    status: 201,
    description: 'Permission created successfully.',
  })
  create(
    @Body() createPermissionDto: CreatePermissionDto,
  ) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all permissions',
  })
  @ApiResponse({
    status: 200,
    description: 'Permissions fetched successfully.',
  })
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get permission by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission fetched successfully.',
  })
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update permission',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission updated successfully.',
  })
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(
      id,
      updatePermissionDto,
    );
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete permission',
  })
  @ApiParam({
    name: 'id',
    description: 'Permission ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Permission deleted successfully.',
  })
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(id);
  }


}
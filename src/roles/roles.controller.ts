import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
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

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';
import { AssignPermissionsDto } from 'src/permissions/dto/assign-permission.dto';

@ApiTags('Roles')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new role',
  })
  @ApiResponse({
    status: 201,
    description: 'Role created successfully.',
  })
  create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all roles',
  })
  @ApiResponse({
    status: 200,
    description: 'Roles fetched successfully.',
  })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get role by id',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Role fetched successfully.',
  })
  findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update role',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Role updated successfully.',
  })
  update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete role',
  })
  @ApiParam({
    name: 'id',
    description: 'Role ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Role deleted successfully.',
  })
  remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
  //   roles & permissions
@Post(':roleId/permissions')
@ApiOperation({
  summary: 'Assign permissions to a role',
})
@ApiParam({
  name: 'roleId',
  description: 'Role ID',
})
@ApiResponse({
  status: 200,
  description: 'Permissions assigned successfully.',
})
assignPermissions(
  @Param('roleId' , new ParseUUIDPipe()) roleId: string,
  @Body() assignPermissionsDto: AssignPermissionsDto,
) {
  return this.rolesService.assignPermissions(
    roleId,
    assignPermissionsDto,
  );
}
}
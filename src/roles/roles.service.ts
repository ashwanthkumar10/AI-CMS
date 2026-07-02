import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { Role } from './entities/role.entity';
import { AssignPermissionsDto } from 'src/permissions/dto/assign-permission.dto';
import { Permission } from 'src/permissions/entities/permission.entity';
import { RolePermission } from 'src/role-permissions/entities/role-permission.entity';

@Injectable()
export class RolesService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) {}

  async create(createRoleDto: CreateRoleDto) {
    try {
      const { name, description } = createRoleDto;

      const existingRole = await this.roleRepository.findOne({
        where: {
          name,
        },
      });

      if (existingRole) {
        throw new ConflictException('Role already exists.');
      }

      const role = this.roleRepository.create({
        name: name.trim(),
        description,
      });

      const savedRole = await this.roleRepository.save(role);

      return {
        message: 'Role created successfully.',
        data: savedRole,
        statusCode: 201,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create role.');
    }
  }

  async findAll() {
    try {
      const roles = await this.roleRepository.find({
        order: {
          createdAt: 'DESC',
        },
      });

      return {
        message: 'Roles fetched successfully.',
        data: roles,
        statusCode: 200,
      };
    } catch {
      throw new InternalServerErrorException('Failed to fetch roles.');
    }
  }

  async findOne(id: string) {
    try {
      const role = await this.roleRepository.findOne({
        where: {
          id,
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found.');
      }

      return {
        message: 'Role fetched successfully.',
        data: role,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch role.');
    }
  }

  async update(id: string, updateRoleDto: UpdateRoleDto) {
    try {
      const role = await this.roleRepository.findOne({
        where: {
          id,
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found.');
      }

      if (updateRoleDto.name && updateRoleDto.name !== role.name) {
        const existingRole = await this.roleRepository.findOne({
          where: {
            name: updateRoleDto.name,
          },
        });

        if (existingRole) {
          throw new ConflictException('Role already exists.');
        }
      }

      Object.assign(role, updateRoleDto);

      const updatedRole = await this.roleRepository.save(role);

      return {
        message: 'Role updated successfully.',
        data: updatedRole,
        statusCode: 200,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update role.');
    }
  }

  async remove(id: string) {
    try {
      const role = await this.roleRepository.findOne({
        where: {
          id,
        },
      });

      if (!role) {
        throw new NotFoundException('Role not found.');
      }

      await this.roleRepository.remove(role);

      return {
        message: 'Role deleted successfully.',
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete role.');
    }
  }

 async assignPermissions(
  roleId: string,
  assignPermissionsDto: AssignPermissionsDto,
) {
  try {
    const { permissionIds } = assignPermissionsDto;

    return await this.entityManager.transaction(async (manager) => {
      // Step 1 - Check if role exists
      const roles = await manager.query(
        `
          SELECT id
          FROM roles
          WHERE id = $1
        `,
        [roleId],
      );

      if (roles.length === 0) {
        throw new NotFoundException('Role not found.');
      }

      // Step 2 - Check if all permissions exist
      const permissions = await manager.query(
        `
          SELECT id
          FROM permissions
          WHERE id = ANY($1::uuid[])
        `,
        [permissionIds],
      );

      if (permissions.length !== permissionIds.length) {
        throw new NotFoundException(
          'One or more permissions were not found.',
        );
      }

      // Step 3 - Check duplicate assignments
      const existingPermissions = await manager.query(
        `
          SELECT permission_id
          FROM role_permissions
          WHERE role_id = $1
          AND permission_id = ANY($2::uuid[])
        `,
        [roleId, permissionIds],
      );

      if (existingPermissions.length > 0) {
        throw new ConflictException(
          'One or more permissions are already assigned to this role.',
        );
      }

      // Step 4 - Insert all mappings
      await manager.query(
        `
          INSERT INTO role_permissions
          (
            role_id,
            permission_id
          )
          SELECT
            $1,
            UNNEST($2::uuid[])
        `,
        [roleId, permissionIds],
      );

      return {
        message: 'Permissions assigned successfully.',
        statusCode: 201,
      };
    });
  } catch (error) {
    if (
      error instanceof NotFoundException ||
      error instanceof ConflictException
    ) {
      
      throw error;
    }
    console.log(error)
    throw new InternalServerErrorException(
      'Failed to assign permissions.',
    );
  }
}
}

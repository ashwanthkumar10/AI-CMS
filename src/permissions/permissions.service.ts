import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { AssignPermissionsDto } from './dto/assign-permission.dto';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}

  async create(createPermissionDto: CreatePermissionDto) {
    try {
      const { name, module, action, description } = createPermissionDto;

      const existingPermissionName = await this.permissionRepository.findOne({
        where: {
          name: name.trim(),
        },
      });

      if (existingPermissionName) {
        throw new ConflictException('Permission name already exists.');
      }

      const existingPermission = await this.permissionRepository.findOne({
        where: {
          module: module.trim(),
          action: action.trim(),
        },
      });

      if (existingPermission) {
        throw new ConflictException(
          `Permission already exists for module '${module}' and action '${action}'.`,
        );
      }

      const permission = this.permissionRepository.create({
        name: name.trim(),
        module: module.trim().toLowerCase(),
        action: action.trim().toLowerCase(),
        description,
      });

      const savedPermission = await this.permissionRepository.save(permission);

      return {
        message: 'Permission created successfully.',
        data: savedPermission,
        statusCode: 201,
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to create permission.');
    }
  }

  async findAll() {
    try {
      const permissions = await this.permissionRepository.find({
        order: {
          module: 'ASC',
          action: 'ASC',
        },
      });

      return {
        message: 'Permissions fetched successfully.',
        data: permissions,
        statusCode: 200,
      };
    } catch {
      throw new InternalServerErrorException('Failed to fetch permissions.');
    }
  }

  async findOne(id: string) {
    try {
      const permission = await this.permissionRepository.findOne({
        where: {
          id,
        },
      });

      if (!permission) {
        throw new NotFoundException('Permission not found.');
      }

      return {
        message: 'Permission fetched successfully.',
        data: permission,
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to fetch permission.');
    }
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto) {
    try {
      const permission = await this.permissionRepository.findOne({
        where: {
          id,
        },
      });

      if (!permission) {
        throw new NotFoundException('Permission not found.');
      }

      if (
        updatePermissionDto.name &&
        updatePermissionDto.name !== permission.name
      ) {
        const existingPermissionName = await this.permissionRepository.findOne({
          where: {
            name: updatePermissionDto.name,
          },
        });

        if (existingPermissionName) {
          throw new ConflictException('Permission name already exists.');
        }
      }

      const module = updatePermissionDto.module ?? permission.module;

      const action = updatePermissionDto.action ?? permission.action;

      const existingPermission = await this.permissionRepository.findOne({
        where: {
          module,
          action,
        },
      });

      if (existingPermission && existingPermission.id !== permission.id) {
        throw new ConflictException(
          `Permission already exists for module '${module}' and action '${action}'.`,
        );
      }

      Object.assign(permission, {
        ...updatePermissionDto,
        module:
          updatePermissionDto.module?.trim().toLowerCase() ?? permission.module,
        action:
          updatePermissionDto.action?.trim().toLowerCase() ?? permission.action,
        name: updatePermissionDto.name?.trim() ?? permission.name,
      });

      const updatedPermission =
        await this.permissionRepository.save(permission);

      return {
        message: 'Permission updated successfully.',
        data: updatedPermission,
        statusCode: 200,
      };
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof NotFoundException
      ) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to update permission.');
    }
  }

  async remove(id: string) {
    try {
      const permission = await this.permissionRepository.findOne({
        where: {
          id,
        },
      });

      if (!permission) {
        throw new NotFoundException('Permission not found.');
      }

      await this.permissionRepository.remove(permission);

      return {
        message: 'Permission deleted successfully.',
        statusCode: 200,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException('Failed to delete permission.');
    }
  }

}

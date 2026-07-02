import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Permission } from 'src/permissions/entities/permission.entity';
import { RolePermission } from 'src/role-permissions/entities/role-permission.entity';



@Module({
  imports: [
  TypeOrmModule.forFeature([Role, Permission ,RolePermission]),
],
  controllers: [RolesController],
  providers: [RolesService],
  exports:[RolesService]
})
export class RolesModule {}

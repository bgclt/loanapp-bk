import { Module } from "@nestjs/common"
import { TypeOrmModule } from "@nestjs/typeorm"
import { RolesController } from "./roles.controller"
import { RolesService } from "./roles.service"
import { PermissionsService } from "./permissions.service"
import { Role } from "./entities/role.entity"
import { Permission } from "./entities/permission.entity"

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission])],
  controllers: [RolesController],
  providers: [RolesService, PermissionsService],
  exports: [RolesService, PermissionsService],
})
export class RolesModule {}

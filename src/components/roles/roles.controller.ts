import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from "@nestjs/swagger";
import { RolesService } from "./roles.service";
import { PermissionsService } from "./permissions.service";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AssignPermissionsDto } from "./dto/assign-permission.dto";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { Permissions } from "../../common/decorators/permission.decorators";
import { Permission } from "../../common/enums/permission.enum";

@ApiTags("Roles & Permissions")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
@Controller("roles")
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly permissionsService: PermissionsService,
  ) {}

  // Role endpoints
  @Post()
  @ApiOperation({ summary: "Create a new role" })
  @ApiResponse({ status: 201, description: "Role created successfully" })
  @ApiResponse({ status: 400, description: "Bad request" })
  @Permissions(Permission.CAN_CREATE_ROLES)
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  @Get()
  @ApiOperation({ summary: "Get all roles" })
  @ApiResponse({ status: 200, description: "Roles retrieved successfully" })
  @Permissions(Permission.CAN_LIST_ROLES)
  findAllRoles() {
    return this.rolesService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get role by ID" })
  @ApiResponse({ status: 200, description: "Role retrieved successfully" })
  @ApiResponse({ status: 404, description: "Role not found" })
  @Permissions(Permission.CAN_GET_ROLES)
  findOneRole(@Param("id") id: string) {
    return this.rolesService.findOne(id);
  }

  @Put(":id")
  @ApiOperation({ summary: "Update role" })
  @ApiResponse({ status: 200, description: "Role updated successfully" })
  @ApiResponse({ status: 404, description: "Role not found" })
  @Permissions(Permission.CAN_UPDATE_ROLES)
  updateRole(@Param("id") id: string, @Body() updateRoleDto: UpdateRoleDto) {
    return this.rolesService.update(id, updateRoleDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete role" })
  @ApiResponse({ status: 200, description: "Role deleted successfully" })
  @ApiResponse({ status: 404, description: "Role not found" })
  @Permissions(Permission.CAN_DELETE_ROLES)
  removeRole(@Param("id") id: string) {
    return this.rolesService.remove(id);
  }

  @Post(":id/permissions")
  @ApiOperation({ summary: "Assign permissions to role" })
  @ApiResponse({ status: 200, description: "Permissions assigned successfully" })
  @ApiResponse({ status: 404, description: "Role not found" })
  @Permissions(Permission.CAN_UPDATE_ROLES)
  assignPermissions(@Param("id") id: string, @Body() assignPermissionsDto: AssignPermissionsDto) {
    return this.rolesService.assignPermissions(id, assignPermissionsDto);
  }

  @Post("seed")
  @ApiOperation({ summary: "Seed default roles" })
  @ApiResponse({ status: 200, description: "Default roles seeded successfully" })
  @Permissions(Permission.ALL)
  seedDefaultRoles() {
    return this.rolesService.seedDefaultRoles();
  }

  // Permission endpoints
  @Post("permissions")
  @ApiOperation({ summary: "Create a new permission" })
  @ApiResponse({ status: 201, description: "Permission created successfully" })
  @Permissions(Permission.CAN_CREATE_ROLES)
  createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get("permissions")
  @ApiOperation({ summary: "Get all permissions" })
  @ApiResponse({ status: 200, description: "Permissions retrieved successfully" })
  @Permissions(Permission.CAN_LIST_ROLES)
  findAllPermissions() {
    return this.permissionsService.findAll();
  }

  @Get("permissions/:id")
  @ApiOperation({ summary: "Get permission by ID" })
  @ApiResponse({ status: 200, description: "Permission retrieved successfully" })
  @ApiResponse({ status: 404, description: "Permission not found" })
  @Permissions(Permission.CAN_GET_ROLES)
  findOnePermission(@Param("id") id: string) {
    return this.permissionsService.findOne(id);
  }

  @Put("permissions/:id")
  @ApiOperation({ summary: "Update permission" })
  @ApiResponse({ status: 200, description: "Permission updated successfully" })
  @ApiResponse({ status: 404, description: "Permission not found" })
  @Permissions(Permission.CAN_UPDATE_ROLES)
  updatePermission(@Param("id") id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(id, updatePermissionDto);
  }

  @Delete("permissions/:id")
  @ApiOperation({ summary: "Delete permission" })
  @ApiResponse({ status: 200, description: "Permission deleted successfully" })
  @ApiResponse({ status: 404, description: "Permission not found" })
  @Permissions(Permission.CAN_DELETE_ROLES)
  removePermission(@Param("id") id: string) {
    return this.permissionsService.remove(id);
  }

  @Post("permissions/seed")
  @ApiOperation({ summary: "Seed default permissions" })
  @ApiResponse({ status: 200, description: "Default permissions seeded successfully" })
  @Permissions(Permission.ALL)
  seedDefaultPermissions() {
    return this.permissionsService.seedDefaultPermissions();
  }
}

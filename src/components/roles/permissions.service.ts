import { Injectable, NotFoundException } from "@nestjs/common";
import { Repository } from "typeorm";
import { Permission } from "./entities/permission.entity";
import { CreatePermissionDto } from "./dto/create-permission.dto";
import { UpdatePermissionDto } from "./dto/update-permission.dto";
import { Permission as PermissionEnum } from "../../common/enums/permission.enum";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}
  async create(createPermissionDto: CreatePermissionDto): Promise<Permission> {
    const permission = this.permissionsRepository.create(createPermissionDto);
    return this.permissionsRepository.save(permission);
  }

  async findAll(): Promise<Permission[]> {
    return this.permissionsRepository.find({
      order: { resource: "ASC", action: "ASC" },
    });
  }

  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionsRepository.findOne({
      where: { id },
      relations: ["roles"],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }

    return permission;
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto): Promise<Permission> {
    await this.permissionsRepository.update(id, updatePermissionDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.permissionsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Permission with ID ${id} not found`);
    }
  }

  async seedDefaultPermissions(): Promise<void> {
    const permissions = [
      // User permissions
      { name: PermissionEnum.CAN_CREATE_USERS, description: "Can create users", resource: "users", action: "create" },
      { name: PermissionEnum.CAN_DELETE_USERS, description: "Can delete users", resource: "users", action: "delete" },
      { name: PermissionEnum.CAN_UPDATE_USERS, description: "Can update users", resource: "users", action: "update" },
      { name: PermissionEnum.CAN_VIEW_USERS, description: "Can view users", resource: "users", action: "view" },
      { name: PermissionEnum.CAN_LIST_USERS, description: "Can list users", resource: "users", action: "list" },
      { name: PermissionEnum.CAN_GET_USERS, description: "Can get user details", resource: "users", action: "get" },

      // Role permissions
      { name: PermissionEnum.CAN_CREATE_ROLES, description: "Can create roles", resource: "roles", action: "create" },
      { name: PermissionEnum.CAN_DELETE_ROLES, description: "Can delete roles", resource: "roles", action: "delete" },
      { name: PermissionEnum.CAN_UPDATE_ROLES, description: "Can update roles", resource: "roles", action: "update" },
      { name: PermissionEnum.CAN_VIEW_ROLES, description: "Can view roles", resource: "roles", action: "view" },
      { name: PermissionEnum.CAN_LIST_ROLES, description: "Can list roles", resource: "roles", action: "list" },
      { name: PermissionEnum.CAN_GET_ROLES, description: "Can get role details", resource: "roles", action: "get" },

      // Loan permissions
      { name: PermissionEnum.CAN_CREATE_LOANS, description: "Can create loans", resource: "loans", action: "create" },
      { name: PermissionEnum.CAN_DELETE_LOANS, description: "Can delete loans", resource: "loans", action: "delete" },
      { name: PermissionEnum.CAN_UPDATE_LOANS, description: "Can update loans", resource: "loans", action: "update" },
      { name: PermissionEnum.CAN_VIEW_LOANS, description: "Can view loans", resource: "loans", action: "view" },
      { name: PermissionEnum.CAN_LIST_LOANS, description: "Can list loans", resource: "loans", action: "list" },
      { name: PermissionEnum.CAN_GET_LOANS, description: "Can get loan details", resource: "loans", action: "get" },
      {
        name: PermissionEnum.CAN_APPROVE_LOANS,
        description: "Can approve loans",
        resource: "loans",
        action: "approve",
      },
      {
        name: PermissionEnum.CAN_DISBURSE_LOANS,
        description: "Can disburse loans",
        resource: "loans",
        action: "disburse",
      },

      // Payment permissions
      {
        name: PermissionEnum.CAN_CREATE_PAYMENTS,
        description: "Can create payments",
        resource: "payments",
        action: "create",
      },
      {
        name: PermissionEnum.CAN_DELETE_PAYMENTS,
        description: "Can delete payments",
        resource: "payments",
        action: "delete",
      },
      {
        name: PermissionEnum.CAN_UPDATE_PAYMENTS,
        description: "Can update payments",
        resource: "payments",
        action: "update",
      },
      {
        name: PermissionEnum.CAN_VIEW_PAYMENTS,
        description: "Can view payments",
        resource: "payments",
        action: "view",
      },
      {
        name: PermissionEnum.CAN_LIST_PAYMENTS,
        description: "Can list payments",
        resource: "payments",
        action: "list",
      },
      {
        name: PermissionEnum.CAN_GET_PAYMENTS,
        description: "Can get payment details",
        resource: "payments",
        action: "get",
      },

      // Log permissions
      { name: PermissionEnum.CAN_DELETE_LOGS, description: "Can delete logs", resource: "logs", action: "delete" },
      { name: PermissionEnum.CAN_VIEW_LOGS, description: "Can view logs", resource: "logs", action: "view" },
      { name: PermissionEnum.CAN_LIST_LOGS, description: "Can list logs", resource: "logs", action: "list" },

      // Report permissions
      { name: PermissionEnum.CAN_VIEW_REPORTS, description: "Can view reports", resource: "reports", action: "view" },
      {
        name: PermissionEnum.CAN_EXPORT_REPORTS,
        description: "Can export reports",
        resource: "reports",
        action: "export",
      },

      // Settings permissions
      {
        name: PermissionEnum.CAN_UPDATE_SETTINGS,
        description: "Can update settings",
        resource: "settings",
        action: "update",
      },
      {
        name: PermissionEnum.CAN_VIEW_SETTINGS,
        description: "Can view settings",
        resource: "settings",
        action: "view",
      },

      // All permissions
      { name: PermissionEnum.ALL, description: "All permissions", resource: "all", action: "all" },
    ];

    for (const permissionData of permissions) {
      const existingPermission = await this.permissionsRepository.findOne({
        where: { name: permissionData.name },
      });

      if (!existingPermission) {
        const permission = this.permissionsRepository.create(permissionData);
        await this.permissionsRepository.save(permission);
      }
    }
  }
}

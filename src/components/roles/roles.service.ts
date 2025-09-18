import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Role } from "./entities/role.entity";
import { Permission } from "./entities/permission.entity";
import { CreateRoleDto } from "./dto/create-role.dto";
import { UpdateRoleDto } from "./dto/update-role.dto";
import { AssignPermissionsDto } from "./dto/assign-permission.dto";
import { RoleType } from "../../common/enums/role.enum";
import { Permission as PermissionEnum } from "../../common/enums/permission.enum";

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,

    @InjectRepository(Permission)
    private readonly permissionsRepository: Repository<Permission>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<Role> {
    // Check if role already exists
    const existingRole = await this.rolesRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new BadRequestException("Role with this name already exists");
    }

    const role = this.rolesRepository.create(createRoleDto);
    return this.rolesRepository.save(role);
  }

  async findAll(): Promise<Role[]> {
    return this.rolesRepository.find({
      relations: ["permissions"],
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { id },
      relations: ["permissions", "users"],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }

    return role;
  }

  async findByName(name: string): Promise<Role | null> {
    return this.rolesRepository.findOne({
      where: { name },
      relations: ["permissions"],
    });
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.findOne(id);

    // Check if new name conflicts with existing role
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: updateRoleDto.name },
      });

      if (existingRole) {
        throw new BadRequestException("Role with this name already exists");
      }
    }

    await this.rolesRepository.update(id, updateRoleDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const role = await this.findOne(id);

    // Check if role has users assigned
    if (role.users && role.users.length > 0) {
      throw new BadRequestException("Cannot delete role that has users assigned to it");
    }

    const result = await this.rolesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Role with ID ${id} not found`);
    }
  }

  async assignPermissions(id: string, assignPermissionsDto: AssignPermissionsDto): Promise<Role> {
    const role = await this.findOne(id);

    const permissions = await this.permissionsRepository.findByIds(assignPermissionsDto.permissionIds);

    if (permissions.length !== assignPermissionsDto.permissionIds.length) {
      throw new BadRequestException("One or more permissions not found");
    }

    role.permissions = permissions;
    await this.rolesRepository.save(role);

    return this.findOne(id);
  }

  async seedDefaultRoles(): Promise<void> {
    const defaultRoles = [
      {
        name: RoleType.OWNER,
        description: "The person who owns the app. Can do anything in the system",
        permissions: [PermissionEnum.ALL],
      },
      {
        name: RoleType.ADMIN,
        description: "Can do anything as owner but cannot delete logs",
        permissions: [
          PermissionEnum.CAN_CREATE_USERS,
          PermissionEnum.CAN_UPDATE_USERS,
          PermissionEnum.CAN_VIEW_USERS,
          PermissionEnum.CAN_LIST_USERS,
          PermissionEnum.CAN_GET_USERS,
          PermissionEnum.CAN_CREATE_ROLES,
          PermissionEnum.CAN_UPDATE_ROLES,
          PermissionEnum.CAN_VIEW_ROLES,
          PermissionEnum.CAN_LIST_ROLES,
          PermissionEnum.CAN_GET_ROLES,
          PermissionEnum.CAN_CREATE_LOANS,
          PermissionEnum.CAN_UPDATE_LOANS,
          PermissionEnum.CAN_VIEW_LOANS,
          PermissionEnum.CAN_LIST_LOANS,
          PermissionEnum.CAN_GET_LOANS,
          PermissionEnum.CAN_APPROVE_LOANS,
          PermissionEnum.CAN_DISBURSE_LOANS,
          PermissionEnum.CAN_CREATE_PAYMENTS,
          PermissionEnum.CAN_UPDATE_PAYMENTS,
          PermissionEnum.CAN_VIEW_PAYMENTS,
          PermissionEnum.CAN_LIST_PAYMENTS,
          PermissionEnum.CAN_GET_PAYMENTS,
          PermissionEnum.CAN_VIEW_LOGS,
          PermissionEnum.CAN_LIST_LOGS,
          PermissionEnum.CAN_VIEW_REPORTS,
          PermissionEnum.CAN_EXPORT_REPORTS,
          PermissionEnum.CAN_UPDATE_SETTINGS,
          PermissionEnum.CAN_VIEW_SETTINGS,
        ],
      },
      {
        name: RoleType.VIEWER,
        description: "Can view everything in the system but cannot add or modify",
        permissions: [
          PermissionEnum.CAN_VIEW_USERS,
          PermissionEnum.CAN_LIST_USERS,
          PermissionEnum.CAN_GET_USERS,
          PermissionEnum.CAN_VIEW_ROLES,
          PermissionEnum.CAN_LIST_ROLES,
          PermissionEnum.CAN_GET_ROLES,
          PermissionEnum.CAN_VIEW_LOANS,
          PermissionEnum.CAN_LIST_LOANS,
          PermissionEnum.CAN_GET_LOANS,
          PermissionEnum.CAN_VIEW_PAYMENTS,
          PermissionEnum.CAN_LIST_PAYMENTS,
          PermissionEnum.CAN_GET_PAYMENTS,
          PermissionEnum.CAN_VIEW_LOGS,
          PermissionEnum.CAN_LIST_LOGS,
          PermissionEnum.CAN_VIEW_REPORTS,
          PermissionEnum.CAN_VIEW_SETTINGS,
        ],
      },
      {
        name: RoleType.MANAGER,
        description: "Disbursement Only",
        permissions: [
          PermissionEnum.CAN_VIEW_LOANS,
          PermissionEnum.CAN_LIST_LOANS,
          PermissionEnum.CAN_GET_LOANS,
          PermissionEnum.CAN_DISBURSE_LOANS,
          PermissionEnum.CAN_VIEW_REPORTS,
        ],
      },
      {
        name: RoleType.CALL_CENTER,
        description: "Registration Process - Registration Capturing",
        permissions: [
          PermissionEnum.CAN_CREATE_LOANS,
          PermissionEnum.CAN_VIEW_LOANS,
          PermissionEnum.CAN_LIST_LOANS,
          PermissionEnum.CAN_GET_LOANS,
        ],
      },
      {
        name: RoleType.SALES_EXECUTIVE,
        description: "Capturing phase - Sales Executives / Loan Officers",
        permissions: [
          PermissionEnum.CAN_UPDATE_LOANS,
          PermissionEnum.CAN_VIEW_LOANS,
          PermissionEnum.CAN_LIST_LOANS,
          PermissionEnum.CAN_GET_LOANS,
        ],
      },
      {
        name: RoleType.LOAN_OFFICER,
        description: "Capturing phase - Sales Executives / Loan Officers",
        permissions: [
          PermissionEnum.CAN_UPDATE_LOANS,
          PermissionEnum.CAN_VIEW_LOANS,
          PermissionEnum.CAN_LIST_LOANS,
          PermissionEnum.CAN_GET_LOANS,
        ],
      },
      {
        name: RoleType.CREDIT_RISK_ANALYST,
        description: "Approval - Credit Risk Analyst is in Charge",
        permissions: [
          PermissionEnum.CAN_VIEW_LOANS,
          PermissionEnum.CAN_LIST_LOANS,
          PermissionEnum.CAN_GET_LOANS,
          PermissionEnum.CAN_APPROVE_LOANS,
          PermissionEnum.CAN_VIEW_REPORTS,
        ],
      },
    ];

    for (const roleData of defaultRoles) {
      const existingRole = await this.rolesRepository.findOne({
        where: { name: roleData.name },
      });

      if (!existingRole) {
        const role = this.rolesRepository.create({
          name: roleData.name,
          description: roleData.description,
        });

        const savedRole = await this.rolesRepository.save(role);

        // Assign permissions
        const permissions = await this.permissionsRepository.find({
          where: roleData.permissions.map(permission => ({ name: permission })),
        });

        savedRole.permissions = permissions;
        await this.rolesRepository.save(savedRole);
      }
    }
  }
}

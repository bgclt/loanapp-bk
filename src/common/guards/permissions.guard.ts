import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../decorators/permission.decorators";
import { Permission } from "../enums/permission.enum";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('PermissionsGuard - Required permissions:', requiredPermissions);

    if (!requiredPermissions) {
      console.log('PermissionsGuard - No permissions required, allowing access');
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    console.log('PermissionsGuard - User:', user ? 'Present' : 'Missing');
    console.log('PermissionsGuard - User roles:', user?.roles?.length || 0);

    if (!user || !user.roles) {
      console.log('PermissionsGuard - User or roles missing, denying access');
      return false;
    }

    // Check if user has 'all' permission
    const userPermissions = user.roles.flatMap(role => role.permissions.map(permission => permission.name));
    console.log('PermissionsGuard - User permissions:', userPermissions);

    if (userPermissions.includes(Permission.ALL)) {
      console.log('PermissionsGuard - User has ALL permission, allowing access');
      return true;
    }

    const hasRequiredPermission = requiredPermissions.some(permission => userPermissions.includes(permission));
    console.log('PermissionsGuard - Has required permission:', hasRequiredPermission);
    return hasRequiredPermission;
  }
}

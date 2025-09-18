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

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.roles) {
      return false;
    }

    // Check if user has 'all' permission
    const userPermissions = user.roles.flatMap(role => role.permissions.map(permission => permission.name));

    if (userPermissions.includes(Permission.ALL)) {
      return true;
    }

    return requiredPermissions.some(permission => userPermissions.includes(permission));
  }
}

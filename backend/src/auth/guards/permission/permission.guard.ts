/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../../services/permission.service';
import { Permission } from '../../enums/permissions.enum';
import { PERMISSIONS_KEY } from '../../decorators/permissions.decorator';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    const anyPermissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY + '_ANY',
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions && !anyPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (requiredPermissions) {
      const hasAllPermissions = this.permissionService.hasAllPermissions(
        user.role,
        requiredPermissions,
      );

      if (!hasAllPermissions) {
        throw new ForbiddenException(
          `Access denied. Required permissions: ${requiredPermissions.join(', ')}`,
        );
      }
    }

    if (anyPermissions) {
      const hasAnyPermission = this.permissionService.hasAnyPermission(
        user.role,
        anyPermissions,
      );

      if (!hasAnyPermission) {
        throw new ForbiddenException(
          `Access denied. Required any of: ${anyPermissions.join(', ')}`,
        );
      }
    }

    return true;
  }
}

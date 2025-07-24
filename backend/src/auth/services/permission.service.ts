// src/auth/services/permission.service.ts
import { Injectable } from '@nestjs/common';
import { Permission } from '../enums/permissions.enum';
import { Resource } from '../enums/resources.enum';
import { Action } from '../enums/actions.enum';
import { Role } from '@prisma/client';

@Injectable()
export class PermissionService {
  canPerformAction(role: Role, action: Action, resource: Resource): boolean {
    const permission = this.getPermissionForAction(action, resource);
    return permission ? this.hasPermission(role, permission) : false;
  }

  getRolePermissions(role: Role): Permission[] {
    // Example: define permissions for each role
    switch (role) {
      case 'ADMIN':
        return Object.values(Permission);
      case 'COURIER':
        return [
          Permission.READ_PARCEL,
          Permission.UPDATE_PARCEL_STATUS,
          Permission.TRACK_PARCEL,
        ];
      case 'USER':
      default:
        return [
          Permission.CREATE_PARCEL,
          Permission.READ_PARCEL,
          Permission.TRACK_PARCEL,
        ];
    }
  }

  canAccessOwnResource(
    role: Role,
    action: Action,
    resource: Resource,
    ownerId: string,
    requesterId: string,
  ): boolean {
    if (role === 'ADMIN') {
      return this.canPerformAction(role, action, resource);
    }
    if (ownerId === requesterId) {
      return this.canPerformAction(role, action, resource);
    }
    return false;
  }

  private getPermissionForAction(
    action: Action,
    resource: Resource,
  ): Permission | null {
    const permissionKey =
      `${action.toUpperCase()}_${resource.toUpperCase()}` as keyof typeof Permission;
    return Permission[permissionKey] || null;
  }

  hasPermission(role: Role, permission: Permission): boolean {
    return this.getRolePermissions(role).includes(permission);
  }

  hasAnyPermission(role: Role, permissions: Permission[]): boolean {
    return permissions.some((permission) =>
      this.hasPermission(role, permission),
    );
  }

  hasAllPermissions(role: Role, permissions: Permission[]): boolean {
    return permissions.every((permission) =>
      this.hasPermission(role, permission),
    );
  }
}

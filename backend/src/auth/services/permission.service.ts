// src/auth/services/permission.service.ts
import { Injectable } from '@nestjs/common';
import { Permission } from '../enums/permissions.enum';
import { Resource } from '../enums/resources.enum';
import { Action } from '../enums/actions.enum';

@Injectable()
export class PermissionService {
  canPerformAction(
    role: Role,
    action: Action,
    resource: Resource,
  ): boolean {
    const permission = this.getPermissionForAction(action, resource);
    return permission ? this.hasPermission(role, permission) : false;
  }

  getRolePermissions(role: Role): Permission[] {
    return [];
  }

  canAccessOwnResource(
    role: Role,
    action: Action,
    resource: Resource,
    ownerId: number,
    requesterId: number,
  ): boolean {
    if (role === "ADMIN") {
      return this.canPerformAction(role, action, resource);
    }

    if (ownerId === requesterId) {
      return this.canPerformAction(role, action, resource);
    }

    // STAFF role not present in Role enum; skip this check

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

import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { JwtAuthGuard } from '../guards/jwt/jwt.guard';
import { PermissionGuard } from '../guards/permission/permission.guard';
import { RequirePermissions } from '../decorators/permissions.decorator';
import { Permission } from '../enums/permissions.enum';
import {
  CurrentUser,
  CurrentUserData,
} from '../decorators/current-user.decorator';
import { Action } from '../enums/actions.enum';
import { Resource } from '../enums/resources.enum';

@Controller('permissions')
@UseGuards(JwtAuthGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get('my-permissions')
  getMyPermissions(@CurrentUser() user: CurrentUserData) {
    return {
      role: user.role,
      permissions: [],
      permissionCount: 0,
    };
  }

  @Get('role/:role')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PERMISSIONS)
  getRolePermissions(@Param('role') role: string) {
    return {
      role,
      permissions: [],
      permissionCount: 0,
    };
  }

  @Get('check/:permission')
  checkPermission(
    @Param('permission') permission: Permission,
    @CurrentUser() user: CurrentUserData,
  ) {
    return {
      permission,
      hasPermission: false,
      role: user.role,
    };
  }

  @Get('check-action')
  checkAction(
    @Query('action') action: Action,
    @Query('resource') resource: Resource,
    @CurrentUser() user: CurrentUserData,
  ) {
    return {
      action,
      resource,
      canPerform: false,
      role: user.role,
    };
  }

  @Get('all-permissions')
  @UseGuards(PermissionGuard)
  @RequirePermissions(Permission.MANAGE_PERMISSIONS)
  getAllPermissions() {
    return {
      permissions: Object.values(Permission),
      resources: Object.values(Resource),
      actions: Object.values(Action),
    };
  }
}

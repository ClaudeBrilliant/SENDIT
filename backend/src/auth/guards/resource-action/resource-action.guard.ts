/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../../services/permission.service';
import { Action } from '../../enums/actions.enum';
import { Resource } from '../../enums/resources.enum';
import { RESOURCE_ACTION_KEY } from '../../decorators/resource-action.decorator';

@Injectable()
export class ResourceActionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const resourceAction = this.reflector.getAllAndOverride<{
      action: Action;
      resource: Resource;
    }>(RESOURCE_ACTION_KEY, [context.getHandler(), context.getClass()]);

    if (!resourceAction) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const canPerform = this.permissionService.canPerformAction(
      user.role,
      resourceAction.action,
      resourceAction.resource,
    );

    if (!canPerform) {
      throw new ForbiddenException(
        `Access denied. Cannot ${resourceAction.action} ${resourceAction.resource}`,
      );
    }

    return true;
  }
}

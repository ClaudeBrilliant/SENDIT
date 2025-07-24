/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionService } from '../../services/permission.service';
import { Action } from '../../enums/actions.enum';
import { Resource } from '../../enums/resources.enum';
import { RESOURCE_OWNER_KEY } from '../../decorators/resource-owner.decorator';
import { RESOURCE_ACTION_KEY } from '../../decorators/resource-action.decorator';
import { UsersService } from '../../../users/users.service';

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionService: PermissionService,
    private usersService: UsersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const ownerField = this.reflector.getAllAndOverride<string>(
      RESOURCE_OWNER_KEY,
      [context.getHandler(), context.getClass()],
    );

    const resourceAction = this.reflector.getAllAndOverride<{
      action: Action;
      resource: Resource;
    }>(RESOURCE_ACTION_KEY, [context.getHandler(), context.getClass()]);

    if (!ownerField || !resourceAction) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const resourceId = request.params.id;
    if (!resourceId) {
      throw new NotFoundException('Resource ID not found');
    }

    const ownerId = await this.getResourceOwnerId(
      resourceAction.resource,
      resourceId,
      ownerField,
    );

    // Only allow if user is owner or has permission
    if (
      user.role === 'ADMIN' ||
      (ownerId &&
        ownerId === user.id &&
        this.permissionService.canPerformAction(
          user.role,
          resourceAction.action,
          resourceAction.resource,
        ))
    ) {
      return true;
    }

    throw new ForbiddenException('You do not have access to this resource');
  }

  private async getResourceOwnerId(
    resource: Resource,
    resourceId: string,
    ownerField: string,
  ): Promise<string | null> {
    switch (resource) {
      case Resource.USER:
        return resourceId;
      case Resource.PARCEL:
        // Example: fetch the parcel and return the ownerId (senderId)
        // You may need to inject a ParcelsService for this
        // return (await this.parcelsService.findById(resourceId))?.senderId ?? null;
        return null; // Implement as needed
      default:
        return null;
    }
  }
}

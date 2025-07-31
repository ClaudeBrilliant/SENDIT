import { Body, Controller, Delete, Get, Param, Patch, Post, Put, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationType } from '@prisma/client';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // Create a notification
  @Post()
  async createNotification(
    @Body('userId') userId: string,
    @Body('content') content: string,
    @Body('type') type: string,
  ) {
    return this.notificationsService.createNotification(userId, content, type as NotificationType);
  }

  // Get all notifications for a user
  @Get()
  async getUserNotifications(@Query('userId') userId: string) {
    return this.notificationsService.getUserNotifications(userId);
  }

  // Get a single notification by id
  @Get(':id')
  async getNotificationById(@Param('id') id: string) {
    return this.notificationsService.getNotificationById(id);
  }

  // Update a notification (e.g., content/type)
  @Patch(':id')
  async updateNotification(
    @Param('id') id: string,
    @Body('content') content?: string,
    @Body('type') type?: string,
  ) {
    return this.notificationsService.updateNotification(id, { content, type });
  }

  // Mark a notification as read
  @Patch(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(id);
  }

  // Delete a notification
  @Delete(':id')
  async deleteNotification(@Param('id') id: string) {
    return this.notificationsService.deleteNotification(id);
  }
} 
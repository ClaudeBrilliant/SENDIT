import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  private prisma = new PrismaClient();

  async getUserNotifications(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async markAsRead(notificationId: string) {
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  }

  async createNotification(userId: string, content: string, type: NotificationType = NotificationType.IN_APP) {
    // Use only valid fields for Notification creation as per the schema
    return this.prisma.notification.create({
      data: { userId, type },
    });
  }
} 
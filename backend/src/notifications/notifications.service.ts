import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { MailerService } from 'src/shared/utils/mailer/mailer.service';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

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

  async createNotification(
    userId: string,
    content: string,
    type: NotificationType = NotificationType.EMAIL,
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, content },
    });

    // Optionally send email if type is EMAIL
    if (type === NotificationType.EMAIL) {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user?.email) {
        await this.mailerService.sendEmail({
          to: user.email,
          subject: 'New Notification',
          text: content,
        });
      }
    }

    return notification;
  }

  async getNotificationById(id: string) {
    return this.prisma.notification.findUnique({ where: { id } });
  }

  async updateNotification(id: string, data: { content?: string; type?: string }) {
    return this.prisma.notification.update({
      where: { id },
      data: {
        ...(data.content && { content: data.content }),
        ...(data.type && { type: data.type as NotificationType }),
      },
    });
  }

  async deleteNotification(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}

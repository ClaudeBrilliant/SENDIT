/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { PrismaClient, NotificationType } from '@prisma/client';
import { MailerService } from 'src/shared/utils/mailer/mailer.service';

@Injectable()
export class NotificationsService {
  private prisma = new PrismaClient();

  constructor(private mailerService: MailerService) {}

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
    type: NotificationType = NotificationType.EMAIL, // Default to EMAIL, or use SMS/PUSH
  ) {
    const notification = await this.prisma.notification.create({
      data: { userId, type, content },
    });

    // Send email notification
    if (type === NotificationType.EMAIL) {
      // Fetch user email if userId is not the email itself
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      const email = user?.email || userId; // fallback if user not found
      await this.mailerService.sendEmail({
        to: email,
        subject: 'New Notification',
        text: content,
      });
    }

    return notification;
  }
}

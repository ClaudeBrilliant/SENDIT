import { Injectable } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationTriggerService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  // Trigger notification when parcel status changes
  async notifyParcelStatusChange(parcelId: string, newStatus: string, userId: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: true,
        receiver: true,
        courier: true,
      },
    });

    if (!parcel) return;

    const statusMessages = {
      'PENDING': 'Your parcel is pending pickup',
      'IN_TRANSIT': 'Your parcel is now in transit',
      'DELIVERED': 'Your parcel has been delivered successfully',
      'CANCELLED': 'Your parcel delivery has been cancelled',
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] || `Your parcel status has been updated to ${newStatus}`;

    // Notify sender
    await this.notificationsService.createNotification(
      parcel.senderId,
      `Parcel ${parcel.id.substring(0, 8)}: ${message}`,
      NotificationType.EMAIL
    );

    // Notify receiver
    await this.notificationsService.createNotification(
      parcel.receiverId,
      `Parcel ${parcel.id.substring(0, 8)}: ${message}`,
      NotificationType.EMAIL
    );

    // Notify courier if assigned
    if (parcel.courierId) {
      await this.notificationsService.createNotification(
        parcel.courierId,
        `Parcel ${parcel.id.substring(0, 8)} status updated to ${newStatus}`,
        NotificationType.EMAIL
      );
    }
  }

  // Trigger notification when courier is assigned
  async notifyCourierAssignment(parcelId: string, courierId: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: true,
        receiver: true,
        courier: true,
      },
    });

    if (!parcel) return;

    // Notify courier about new assignment
    await this.notificationsService.createNotification(
      courierId,
      `You have been assigned a new delivery task. Parcel ID: ${parcel.id.substring(0, 8)}`,
      NotificationType.EMAIL
    );

    // Notify sender and receiver about courier assignment
    const courierName = parcel.courier ? `${parcel.courier.firstName} ${parcel.courier.lastName}` : 'a courier';
    
    await this.notificationsService.createNotification(
      parcel.senderId,
      `Your parcel has been assigned to ${courierName}. Parcel ID: ${parcel.id.substring(0, 8)}`,
      NotificationType.EMAIL
    );

    await this.notificationsService.createNotification(
      parcel.receiverId,
      `Your parcel has been assigned to ${courierName}. Parcel ID: ${parcel.id.substring(0, 8)}`,
      NotificationType.EMAIL
    );
  }

  // Trigger notification when admin receives contact form message
  async notifyAdminContactForm(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    // Get all admin users
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    // Notify each admin
    for (const admin of admins) {
      await this.notificationsService.createNotification(
        admin.id,
        `New contact form submission from ${contactData.name} (${contactData.email}): "${contactData.subject}" - ${contactData.message.substring(0, 50)}${contactData.message.length > 50 ? '...' : ''}`,
        NotificationType.EMAIL
      );
    }
  }

  // Trigger notification when courier updates parcel status
  async notifyCourierStatusUpdate(parcelId: string, courierId: string, newStatus: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: true,
        receiver: true,
        courier: true,
      },
    });

    if (!parcel) return;

    const statusMessages = {
      'PICKED_UP': 'Your parcel has been picked up by the courier',
      'IN_TRANSIT': 'Your parcel is now in transit',
      'OUT_FOR_DELIVERY': 'Your parcel is out for delivery',
      'DELIVERED': 'Your parcel has been delivered successfully',
    };

    const message = statusMessages[newStatus as keyof typeof statusMessages] || `Your parcel status has been updated to ${newStatus}`;

    // Notify sender
    await this.notificationsService.createNotification(
      parcel.senderId,
      `Parcel ${parcel.id.substring(0, 8)}: ${message}`,
      NotificationType.EMAIL
    );

    // Notify receiver
    await this.notificationsService.createNotification(
      parcel.receiverId,
      `Parcel ${parcel.id.substring(0, 8)}: ${message}`,
      NotificationType.EMAIL
    );

    // Notify admin about status update
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    for (const admin of admins) {
      await this.notificationsService.createNotification(
        admin.id,
        `Courier updated parcel ${parcel.id.substring(0, 8)} status to ${newStatus}`,
        NotificationType.EMAIL
      );
    }
  }

  // Trigger notification for new parcel creation
  async notifyParcelCreated(parcelId: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: true,
        receiver: true,
      },
    });

    if (!parcel) return;

    // Notify sender
    await this.notificationsService.createNotification(
      parcel.senderId,
      `Your parcel has been created successfully. Tracking ID: ${parcel.id.substring(0, 8)}`,
      NotificationType.EMAIL
    );

    // Notify receiver
    await this.notificationsService.createNotification(
      parcel.receiverId,
      `A parcel is being sent to you. Tracking ID: ${parcel.id.substring(0, 8)}`,
      NotificationType.EMAIL
    );

    // Notify admin about new parcel
    const admins = await this.prisma.user.findMany({
      where: { role: 'ADMIN' },
    });

    for (const admin of admins) {
      await this.notificationsService.createNotification(
        admin.id,
        `New parcel created. Tracking ID: ${parcel.id.substring(0, 8)}`,
        NotificationType.EMAIL
      );
    }
  }
} 
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { PrismaClient, NotificationType } from '@prisma/client';
import {
  MailerService,
  ParcelInfo,
} from '../shared/utils/mailer/mailer.service';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  constructor(private readonly mailerService: MailerService) {}

  // Create a new parcel
  async createParcel(data: any) {
    const parcel = await this.prisma.parcel.create({
      data,
      include: {
        pickupLocation: true,
        deliveryLocation: true,
      },
    });
    const receiver = await this.prisma.user.findUnique({
      where: { id: parcel.receiverId },
    });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        pickupLocation: parcel.pickupLocation.address,
        deliveryLocation: parcel.deliveryLocation.address,
      };
      await this.mailerService.sendOrderCreatedEmail(
        receiver.email,
        parcelInfo,
      );
    }
    return parcel;
  }

  // Update parcel status
  async updateParcelStatus(parcelId: string, statusId: string) {
    const parcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { currentStatusId: statusId },
      include: {
        pickupLocation: true,
        deliveryLocation: true,
      },
    });
    const receiver = await this.prisma.user.findUnique({
      where: { id: parcel.receiverId },
    });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        pickupLocation: parcel.pickupLocation.address,
        deliveryLocation: parcel.deliveryLocation.address,
      };
      await this.mailerService.sendStatusUpdateEmail(
        receiver.email,
        parcelInfo,
        statusId,
      );
      // Optionally, fetch the DeliveryStatus to check the status string
      const statusObj = await this.prisma.deliveryStatus.findUnique({
        where: { id: statusId },
      });
      if (statusObj && statusObj.status.toLowerCase() === 'delivered') {
        await this.mailerService.sendDeliveryNotification(
          receiver.email,
          parcelInfo,
        );
      }
    }
    return parcel;
  }

  // List all parcels
  async listParcels() {
    return this.prisma.parcel.findMany({
      include: {
        sender: true,
        receiver: true,
        pickupLocation: true,
        deliveryLocation: true,
        currentStatus: true,
      },
    });
  }

  // List all users
  async listUsers() {
    return this.prisma.user.findMany();
  }

  // List all couriers
  async listCouriers() {
    return this.prisma.user.findMany({
      where: { role: 'COURIER' },
    });
  }

  // Get user by ID
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  // Update user
  async updateUser(userId: string, data: any) {
    return this.prisma.user.update({ where: { id: userId }, data });
  }

  // Delete user
  async deleteUser(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } });
  }

  // Get parcel by ID
  async getParcelById(parcelId: string) {
    return this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: true,
        receiver: true,
        pickupLocation: true,
        deliveryLocation: true,
        currentStatus: true,
      },
    });
  }

  // Update parcel
  async updateParcel(parcelId: string, data: any) {
    return this.prisma.parcel.update({ where: { id: parcelId }, data });
  }

  // Delete parcel
  async deleteParcel(parcelId: string) {
    return this.prisma.parcel.delete({ where: { id: parcelId } });
  }

  // Create a notification
  async createNotification(userId: string, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        type: NotificationType.EMAIL, // or SMS or PUSH
        content: message,
      },
    });
  }
}

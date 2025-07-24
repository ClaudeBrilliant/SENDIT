import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MailerService, ParcelInfo } from '../shared/utils/mailer/mailer.service';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  constructor(private readonly mailerService: MailerService) {}

  // Create a new parcel
  async createParcel(data: any) {
    const parcel = await this.prisma.parcel.create({ data });
    const receiver = await this.prisma.user.findUnique({ where: { id: parcel.receiverId } });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        pickupLocation: parcel.pickupAddress,
        deliveryLocation: parcel.destAddress,
      };
      await this.mailerService.sendOrderCreatedEmail(receiver.email, parcelInfo);
    }
    return parcel;
  }

  // Update parcel status (using 'status' field)
  async updateParcelStatus(parcelId: string, status: string) {
    const parcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { status: status as any }, // TODO: Replace 'as any' with the correct DeliveryStatus enum if available
    });
    const receiver = await this.prisma.user.findUnique({ where: { id: parcel.receiverId } });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        pickupLocation: parcel.pickupAddress,
        deliveryLocation: parcel.destAddress,
      };
      await this.mailerService.sendStatusUpdateEmail(receiver.email, parcelInfo, status);
      if (status.toLowerCase() === 'delivered') {
        await this.mailerService.sendDeliveryNotification(receiver.email, parcelInfo);
      }
    }
    return parcel;
  }

  // List all parcels
  async listParcels() {
    return this.prisma.parcel.findMany({
      // Removed invalid include: pickupLocation
      include: {
        sender: true,
        receiver: true,
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
    // Removed role-based query
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
    return this.prisma.parcel.findUnique({ where: { id: parcelId } });
  }

  // Update parcel
  async updateParcel(parcelId: string, data: any) {
    return this.prisma.parcel.update({ where: { id: parcelId }, data });
  }

  // Delete parcel
  async deleteParcel(parcelId: string) {
    return this.prisma.parcel.delete({ where: { id: parcelId } });
  }
}

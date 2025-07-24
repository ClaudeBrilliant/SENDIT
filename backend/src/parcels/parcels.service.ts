import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { MailerService, ParcelInfo } from '../shared/utils/mailer/mailer.service';

@Injectable()
export class ParcelsService {
  private prisma = new PrismaClient();

  constructor(private readonly mailerService: MailerService) {}

  // Create a new parcel
  async createParcel(data: any) {
    const parcel = await this.prisma.parcel.create({ data });
    // Fetch receiver email and info
    const receiver = await this.prisma.user.findUnique({ where: { id: parcel.receiverId } });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        // Use valid fields from the schema for pickup and delivery locations
        pickupLocation: parcel.pickupLocationId,
        deliveryLocation: parcel.deliveryLocationId,
      };
      await this.mailerService.sendOrderCreatedEmail(receiver.email, parcelInfo);
    }
    return parcel;
  }

  // Get parcels sent by a user
  async getSentParcels(userId: string) {
    return this.prisma.parcel.findMany({ where: { senderId: userId } });
  }

  // Get parcels received by a user
  async getReceivedParcels(userId: string) {
    return this.prisma.parcel.findMany({ where: { receiverId: userId } });
  }

  // Get parcels assigned to a courier
  async getAssignedParcels(courierId: string) {
    // Use valid field for courier assignment if available in schema
    return this.prisma.parcel.findMany({ where: { courierId } });
  }

  // Get parcel details by id
  async getParcelById(parcelId: string) {
    return this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: true,
        receiver: true,
        courier: true,
        pickupLocation: true,
        deliveryLocation: true,
        currentStatus: true,
        proofOfDelivery: true,
        tracking: true,
      },
    });
  }

  // Update parcel status
  async updateParcelStatus(parcelId: string, currentStatusId: string) {
    const parcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      // Use valid field for status update if available in schema
      data: { currentStatusId },
    });
    // Fetch receiver email and info
    const receiver = await this.prisma.user.findUnique({ where: { id: parcel.receiverId } });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        // Use valid fields from the schema for pickup and delivery locations
        pickupLocation: parcel.pickupLocationId,
        deliveryLocation: parcel.deliveryLocationId,
      };
      // Send status update email
      await this.mailerService.sendStatusUpdateEmail(receiver.email, parcelInfo, currentStatusId);
      // If delivered, send delivery notification
      if (currentStatusId.toLowerCase() === 'delivered') {
        await this.mailerService.sendDeliveryNotification(receiver.email, parcelInfo);
      }
    }
    return parcel;
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  MailerService,
  ParcelInfo,
} from '../shared/utils/mailer/mailer.service';
import { CreateParcelDto } from './dtos/CreateParcelDto';

@Injectable()
export class ParcelsService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
  ) {}

  async createParcel(dto: CreateParcelDto) {
    // Find or create pickup location by address
    let pickupLocation = await this.prisma.location.findFirst({
      where: { address: dto.pickupAddress },
    });
    if (!pickupLocation) {
      pickupLocation = await this.prisma.location.create({
        data: {
          address: dto.pickupAddress,
          label: dto.pickupAddress, // Use address as label for now
          latitude: 0, // Replace with real coordinates if available
          longitude: 0,
        },
      });
    }

    // Find or create delivery location by address
    let deliveryLocation = await this.prisma.location.findFirst({
      where: { address: dto.deliveryAddress },
    });
    if (!deliveryLocation) {
      deliveryLocation = await this.prisma.location.create({
        data: {
          address: dto.deliveryAddress,
          label: dto.deliveryAddress, // Use address as label for now
          latitude: 0, // Replace with real coordinates if available
          longitude: 0,
        },
      });
    }

    // Find status by name
    const status = await this.prisma.deliveryStatus.findFirst({
      where: { status: dto.statusName },
    });
    if (!status) throw new NotFoundException('Status not found');

    // Create the parcel using the found/created IDs
    const parcel = await this.prisma.parcel.create({
      data: {
        senderId: dto.senderId,
        receiverId: dto.receiverId,
        courierId: dto.courierId,
        weight: dto.weight,
        price: dto.price,
        pickupLocationId: pickupLocation.id,
        deliveryLocationId: deliveryLocation.id,
        currentStatusId: status.id,
      },
    });
    // Fetch receiver email and info
    const receiver = await this.prisma.user.findUnique({
      where: { id: parcel.receiverId },
    });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        // Use valid fields from the schema for pickup and delivery locations
        pickupLocation: parcel.pickupLocationId,
        deliveryLocation: parcel.deliveryLocationId,
      };
      await this.mailerService.sendOrderCreatedEmail(
        receiver.email,
        parcelInfo,
      );
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
      data: { currentStatus: currentStatusId }, // statusName must be a valid DeliveryStatusEnum value
    });
    // Fetch receiver email and info
    const receiver = await this.prisma.user.findUnique({
      where: { id: parcel.receiverId },
    });
    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        // Use valid fields from the schema for pickup and delivery locations
        pickupLocation: parcel.pickupLocationId,
        deliveryLocation: parcel.deliveryLocationId,
      };
      // Send status update email
      await this.mailerService.sendStatusUpdateEmail(
        receiver.email,
        parcelInfo,
        currentStatusId,
      );
      // If delivered, send delivery notification
      if (currentStatusId.toLowerCase() === 'delivered') {
        await this.mailerService.sendDeliveryNotification(
          receiver.email,
          parcelInfo,
        );
      }
    }
    return parcel;
  }
}

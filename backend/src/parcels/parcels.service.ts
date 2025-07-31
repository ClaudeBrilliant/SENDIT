import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import {
  MailerService,
  ParcelInfo,
} from '../shared/utils/mailer/mailer.service';
import { CreateParcelDto } from './dtos/CreateParcelDto';
import { DeliveryStatusEnum } from '@prisma/client';
import { NotificationTriggerService } from '../notifications/notification-trigger.service';

@Injectable()
export class ParcelsService {
  constructor(
    private prisma: PrismaService,
    private readonly mailerService: MailerService,
    private readonly notificationTriggerService: NotificationTriggerService,
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
    const status = dto.statusName as DeliveryStatusEnum; // Use the enum type

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
        currentStatus: status as DeliveryStatusEnum,
      },
    });

    // Trigger notifications for parcel creation
    await this.notificationTriggerService.notifyParcelCreated(parcel.id);

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
    console.log('Getting sent parcels for user ID:', userId);
    
    const parcels = await this.prisma.parcel.findMany({ 
      where: { senderId: userId },
      include: {
        sender: true,
        receiver: true,
        courier: true,
        pickupLocation: true,
        deliveryLocation: true
      }
    });

    console.log('Raw parcels from database:', parcels);

    const formattedParcels = parcels.map(parcel => ({
      id: parcel.id,
      trackingNumber: parcel.id,
      senderName: `${parcel.sender.firstName} ${parcel.sender.lastName}`,
      senderEmail: parcel.sender.email,
      receiverName: `${parcel.receiver.firstName} ${parcel.receiver.lastName}`,
      receiverEmail: parcel.receiver.email,
      pickupAddress: parcel.pickupLocation?.address || 'Pickup Location',
      deliveryAddress: parcel.deliveryLocation?.address || 'Delivery Location',
      status: parcel.currentStatus,
      weight: parcel.weight,
      weightCategory: this.getWeightCategory(parcel.weight),
      price: parcel.price,
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
      estimatedDelivery: this.calculateEstimatedDelivery(parcel.createdAt, parcel.currentStatus),
      courier: parcel.courier ? `${parcel.courier.firstName} ${parcel.courier.lastName}` : null,
      courierId: parcel.courierId || null
    }));

    console.log('Formatted parcels:', formattedParcels);
    return formattedParcels;
  }

  // Get parcels received by a user
  async getReceivedParcels(userId: string) {
    console.log('Getting received parcels for user ID:', userId);
    
    const parcels = await this.prisma.parcel.findMany({ 
      where: { receiverId: userId },
      include: {
        sender: true,
        receiver: true,
        courier: true,
        pickupLocation: true,
        deliveryLocation: true
      }
    });

    console.log('Raw received parcels from database:', parcels);

    const formattedParcels = parcels.map(parcel => ({
      id: parcel.id,
      trackingNumber: parcel.id,
      senderName: `${parcel.sender.firstName} ${parcel.sender.lastName}`,
      senderEmail: parcel.sender.email,
      receiverName: `${parcel.receiver.firstName} ${parcel.receiver.lastName}`,
      receiverEmail: parcel.receiver.email,
      pickupAddress: parcel.pickupLocation?.address || 'Pickup Location',
      deliveryAddress: parcel.deliveryLocation?.address || 'Delivery Location',
      status: parcel.currentStatus,
      weight: parcel.weight,
      weightCategory: this.getWeightCategory(parcel.weight),
      price: parcel.price,
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
      estimatedDelivery: this.calculateEstimatedDelivery(parcel.createdAt, parcel.currentStatus),
      courier: parcel.courier ? `${parcel.courier.firstName} ${parcel.courier.lastName}` : null,
      courierId: parcel.courierId || null
    }));

    console.log('Formatted received parcels:', formattedParcels);
    return formattedParcels;
  }

  // Get parcels assigned to a courier
  async getAssignedParcels(courierId: string) {
    return this.prisma.parcel.findMany({ 
      where: { courierId },
      include: {
        sender: true,
        receiver: true,
        pickupLocation: true,
        deliveryLocation: true
      }
    });
  }

  // Track parcel by tracking number
  async trackParcel(trackingNumber: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: trackingNumber },
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        receiver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        courier: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        pickupLocation: true,
        deliveryLocation: true,
        tracking: {
          orderBy: { timestamp: 'desc' },
          take: 10
        },
        proofOfDelivery: true
      }
    });

    if (!parcel) {
      throw new NotFoundException('Parcel not found');
    }

    // Calculate estimated delivery date
    const estimatedDelivery = this.calculateEstimatedDelivery(parcel.createdAt, parcel.currentStatus);

    return {
      id: parcel.id,
      trackingNumber: parcel.id,
      sender: {
        name: `${parcel.sender.firstName} ${parcel.sender.lastName}`,
        email: parcel.sender.email,
        phone: parcel.sender.phone
      },
      receiver: {
        name: `${parcel.receiver.firstName} ${parcel.receiver.lastName}`,
        email: parcel.receiver.email,
        phone: parcel.receiver.phone
      },
      courier: parcel.courier ? {
        name: `${parcel.courier.firstName} ${parcel.courier.lastName}`,
        email: parcel.courier.email,
        phone: parcel.courier.phone
      } : null,
      pickupLocation: parcel.pickupLocation?.address || 'Pickup Location',
      deliveryLocation: parcel.deliveryLocation?.address || 'Delivery Location',
      currentStatus: parcel.currentStatus,
      weight: parcel.weight,
      price: parcel.price,
      createdAt: parcel.createdAt,
      updatedAt: parcel.updatedAt,
      estimatedDelivery,
      trackingHistory: parcel.tracking.map(track => ({
        location: track.location,
        timestamp: track.timestamp
      })),
      proofOfDelivery: parcel.proofOfDelivery ? {
        signature: parcel.proofOfDelivery.signature,
        notes: parcel.proofOfDelivery.notes,
        deliveredAt: parcel.proofOfDelivery.deliveredAt
      } : null
    };
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
        proofOfDelivery: true,
        tracking: true,
      },
    });
  }

  // Update parcel status
  async updateParcelStatus(parcelId: string, currentStatusId: string) {
    const parcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { currentStatus: currentStatusId as DeliveryStatusEnum }, // statusName must be a valid DeliveryStatusEnum value
    });

    // Trigger notifications for status change
    await this.notificationTriggerService.notifyParcelStatusChange(parcelId, currentStatusId, parcel.senderId);

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

  async getCourierHistory(courierId: string) {
    return this.prisma.parcel.findMany({
      where: {
        courierId,
        OR: [
          { currentStatus: 'DELIVERED' },
          { currentStatus: 'CANCELLED' },
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  // Helper method to determine weight category
  private getWeightCategory(weight: number): string {
    if (weight <= 1) return 'LIGHT';
    if (weight <= 5) return 'MEDIUM';
    return 'HEAVY';
  }

  // Helper method to calculate estimated delivery date
  private calculateEstimatedDelivery(createdAt: Date, status: string): Date {
    const created = new Date(createdAt);
    let estimatedDays = 3; // Default 3 days for standard delivery
    
    if (status === 'DELIVERED') {
      estimatedDays = 0;
    } else if (status === 'IN_TRANSIT') {
      estimatedDays = 1;
    } else if (status === 'PICKED_UP') {
      estimatedDays = 2;
    }
    
    const estimated = new Date(created);
    estimated.setDate(estimated.getDate() + estimatedDays);
    return estimated;
  }
}

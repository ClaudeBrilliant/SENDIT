import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DeliveryStatusEnum } from '@prisma/client';
import { AdminService } from '../admin/admin.service';
import { NotificationTriggerService } from '../notifications/notification-trigger.service';

@Injectable()
export class CourierService {
  private prisma = new PrismaClient();

  constructor(
    private adminService: AdminService,
    private readonly notificationTriggerService: NotificationTriggerService,
  ) {}

  // Get parcels assigned to this courier
  async getAssignedParcels(courierId: string) {
    return this.prisma.parcel.findMany({ 
      where: { courierId },
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
        pickupLocation: true,
        deliveryLocation: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Courier updates parcel location/status
  async updateParcelLocation(parcelId: string, location: string, currentStatus: string) {
    // Get parcel info for logging
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: { courier: true }
    });

    if (!parcel) {
      throw new Error('Parcel not found');
    }

    // Update parcel's current status
    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { currentStatus: currentStatus as DeliveryStatusEnum },
    });

    // Add a tracking entry for location update
    await this.prisma.parcelTracking.create({
      data: {
        parcelId: parcelId,
        location: location,
        timestamp: new Date()
      }
    });

    // Trigger notifications for courier status update
    await this.notificationTriggerService.notifyCourierStatusUpdate(parcelId, parcel.courierId!, currentStatus);

    // Log the location update
    await this.adminService.createLog({
      action: 'LOCATION_UPDATED',
      details: `Courier ${parcel.courier?.firstName} ${parcel.courier?.lastName} updated parcel ${parcelId} location to: ${location}, status: ${currentStatus}`,
      userId: parcel.courierId || undefined
    });

    return updatedParcel;
  }

  // Get tracking history for a parcel
  async getParcelTrackingHistory(parcelId: string) {
    return this.prisma.parcelTracking.findMany({
      where: { parcelId },
      orderBy: { timestamp: 'desc' }
    });
  }

  // Update courier's current location
  async updateCourierLocation(courierId: string, latitude: number, longitude: number, address: string) {
    // Get courier info for logging
    const courier = await this.prisma.user.findUnique({
      where: { id: courierId }
    });

    // Store courier location in the database
    const location = await this.prisma.courierLocation.create({
      data: {
        courierId,
        latitude,
        longitude,
        address
      }
    });

    // Log the location update
    await this.adminService.createLog({
      action: 'COURIER_LOCATION_UPDATED',
      details: `Courier ${courier?.firstName} ${courier?.lastName} updated location to: ${address} (${latitude}, ${longitude})`,
      userId: courierId
    });

    return {
      success: true,
      message: 'Location updated successfully',
      location: {
        id: location.id,
        latitude: location.latitude,
        longitude: location.longitude,
        address: location.address,
        timestamp: location.timestamp
      }
    };
  }

  // Get courier's latest location
  async getCourierLatestLocation(courierId: string) {
    const location = await this.prisma.courierLocation.findFirst({
      where: { courierId },
      orderBy: { timestamp: 'desc' }
    });

    return location;
  }
} 
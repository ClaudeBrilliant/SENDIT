import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DeliveryStatusEnum } from '@prisma/client';

@Injectable()
export class CourierService {
  private prisma = new PrismaClient();

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
    // Store courier location in the database
    const location = await this.prisma.courierLocation.create({
      data: {
        courierId,
        latitude,
        longitude,
        address
      }
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
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaClient, NotificationType, DeliveryStatusEnum } from '@prisma/client';
import {
  MailerService,
  ParcelInfo,
} from '../shared/utils/mailer/mailer.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateParcelDto } from './dto/create-parcel.dto';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { NotificationTriggerService } from '../notifications/notification-trigger.service';

@Injectable()
export class AdminService {
  private prisma = new PrismaClient();

  constructor(
    private readonly mailerService: MailerService,
    private prismaService: PrismaService,
    private readonly notificationTriggerService: NotificationTriggerService,
  ) {}

  // Create parcel
  async createParcel(data: CreateParcelDto) {
    try {
      // Create or find sender user
      let sender = await this.prisma.user.findUnique({
        where: { email: data.senderEmail }
      });

      if (!sender) {
        // Create new sender user
        const [firstName, ...lastNameParts] = data.senderName.split(' ');
        const lastName = lastNameParts.join(' ') || 'Unknown';
        
        // Generate a unique phone number if there's a conflict
        let phoneNumber = data.senderPhone;
        let phoneExists = await this.prisma.user.findUnique({
          where: { phone: phoneNumber }
        });
        
        if (phoneExists) {
          // Add a random suffix to make it unique
          phoneNumber = `${data.senderPhone}_${Math.random().toString(36).substring(2, 6)}`;
        }
        
        sender = await this.prisma.user.create({
          data: {
            firstName,
            lastName,
            email: data.senderEmail,
            phone: phoneNumber,
            password: 'defaultPassword123!', // You might want to generate a random password
            role: 'USER'
          }
        });
      }

      // Create or find receiver user
      let receiver = await this.prisma.user.findUnique({
        where: { email: data.receiverEmail }
      });

      if (!receiver) {
        // Create new receiver user
        const [firstName, ...lastNameParts] = data.receiverName.split(' ');
        const lastName = lastNameParts.join(' ') || 'Unknown';
        
        // Generate a unique phone number if there's a conflict
        let phoneNumber = data.receiverPhone;
        let phoneExists = await this.prisma.user.findUnique({
          where: { phone: phoneNumber }
        });
        
        if (phoneExists) {
          // Add a random suffix to make it unique
          phoneNumber = `${data.receiverPhone}_${Math.random().toString(36).substring(2, 6)}`;
        }
        
        receiver = await this.prisma.user.create({
          data: {
            firstName,
            lastName,
            email: data.receiverEmail,
            phone: phoneNumber,
            password: 'defaultPassword123!', // You might want to generate a random password
            role: 'USER'
          }
        });
      }

      // Create or find pickup location
      let pickupLocation = await this.prisma.location.findFirst({
        where: { address: data.senderAddress }
      });

      if (!pickupLocation) {
        pickupLocation = await this.prisma.location.create({
          data: {
            address: data.senderAddress,
            label: data.senderAddress,
            latitude: 0, // You might want to geocode the address
            longitude: 0
          }
        });
      }

      // Create or find delivery location
      let deliveryLocation = await this.prisma.location.findFirst({
        where: { address: data.receiverAddress }
      });

      if (!deliveryLocation) {
        deliveryLocation = await this.prisma.location.create({
          data: {
            address: data.receiverAddress,
            label: data.receiverAddress,
            latitude: 0, // You might want to geocode the address
            longitude: 0
          }
        });
      }

      // Create the parcel
      const parcel = await this.prisma.parcel.create({
        data: {
          senderId: sender.id,
          receiverId: receiver.id,
          weight: data.weight,
          price: data.price,
          pickupLocationId: pickupLocation.id,
          deliveryLocationId: deliveryLocation.id,
          currentStatus: 'PENDING'
        }
      });

      // Send email notification to receiver
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        pickupLocation: data.senderAddress,
        deliveryLocation: data.receiverAddress,
      };

      await this.mailerService.sendOrderCreatedEmail(
        receiver.email,
        parcelInfo,
      );

      // Create a log entry
      await this.createLog({
        action: 'PARCEL_CREATED',
        details: `Parcel created by admin: ${parcel.id}`,
        userId: sender.id
      });

      return parcel;
    } catch (error) {
      console.error('Error creating parcel:', error);
      throw new ConflictException('Failed to create parcel');
    }
  }

  // Update parcel status
  async updateParcelStatus(parcelId: string, status: string) {
    const parcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { currentStatus: status as DeliveryStatusEnum }
    });

    // Send status update email
    const receiver = await this.prisma.user.findUnique({
      where: { id: parcel.receiverId }
    });

    if (receiver) {
      const parcelInfo: ParcelInfo = {
        trackingNumber: parcel.id,
        pickupLocation: 'Pickup Location',
        deliveryLocation: 'Delivery Location',
      };

      await this.mailerService.sendStatusUpdateEmail(
        receiver.email,
        parcelInfo,
        status
      );
    }

    // Create a log entry
    await this.createLog({
      action: 'STATUS_UPDATED',
      details: `Parcel ${parcelId} status updated to ${status}`,
    });

    return parcel;
  }

  // List all parcels
  async listParcels() {
    return this.prisma.parcel.findMany({
      include: {
        sender: true,
        receiver: true,
        courier: true,
        pickupLocation: true,
        deliveryLocation: true
      }
    });
  }

  // List all users
  async listUsers() {
    return this.prisma.user.findMany({ where: { role: 'USER' } });
  }

  // List all couriers
  async listCouriers() {
    return this.prisma.user.findMany({ where: { role: 'COURIER' } });
  }

  // Get user by ID
  async getUserById(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  // Update user
  async updateUser(userId: string, data: any) {
    return this.prisma.user.update({
      where: { id: userId },
      data
    });
  }

  // Delete user
  async deleteUser(userId: string) {
    // Check if user has any parcels
    const userParcels = await this.prisma.parcel.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
          { courierId: userId }
        ]
      }
    });

    if (userParcels.length > 0) {
      throw new ConflictException('Cannot delete user with existing parcels');
    }

    return this.prisma.user.delete({
      where: { id: userId }
    });
  }

  // Get parcel by ID
  async getParcelById(parcelId: string) {
    return this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        sender: true,
        receiver: true,
        courier: true,
        pickupLocation: true,
        deliveryLocation: true,
        tracking: {
          orderBy: { timestamp: 'desc' }
        },
        proofOfDelivery: true
      }
    });
  }

  // Update parcel
  async updateParcel(parcelId: string, data: any) {
    return this.prisma.parcel.update({
      where: { id: parcelId },
      data
    });
  }

  // Delete parcel
  async deleteParcel(parcelId: string) {
    // Delete related records first
    await this.prisma.parcelTracking.deleteMany({
      where: { parcelId }
    });

    await this.prisma.proofOfDelivery.deleteMany({
      where: { parcelId }
    });

    return this.prisma.parcel.delete({
      where: { id: parcelId }
    });
  }

  // Create notification
  async createNotification(userId: string, message: string) {
    return this.prisma.notification.create({
      data: {
        userId,
        content: message,
        type: NotificationType.EMAIL
      }
    });
  }

  // Register admin
  async registerAdmin(dto: CreateAdminDto) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const admin = await this.prisma.user.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phone: dto.phone,
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    return {
      id: admin.id,
      firstName: admin.firstName,
      lastName: admin.lastName,
      email: admin.email,
      phone: admin.phone,
      role: admin.role
    };
  }

  // Get all parcels with detailed information
  async getAllParcels() {
    const parcels = await this.prisma.parcel.findMany({
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        receiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
          }
        },
        courier: {
          select: {
            id: true,
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
          take: 5
        },
        proofOfDelivery: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return parcels.map(parcel => ({
      id: parcel.id,
      trackingNumber: parcel.id,
      sender: {
        id: parcel.sender.id,
        name: `${parcel.sender.firstName} ${parcel.sender.lastName}`,
        email: parcel.sender.email,
        phone: parcel.sender.phone
      },
      receiver: {
        id: parcel.receiver.id,
        name: `${parcel.receiver.firstName} ${parcel.receiver.lastName}`,
        email: parcel.receiver.email,
        phone: parcel.receiver.phone
      },
      courier: parcel.courier ? {
        id: parcel.courier.id,
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
      trackingHistory: parcel.tracking.map(track => ({
        location: track.location,
        timestamp: track.timestamp
      })),
      proofOfDelivery: parcel.proofOfDelivery ? {
        signature: parcel.proofOfDelivery.signature,
        notes: parcel.proofOfDelivery.notes,
        deliveredAt: parcel.proofOfDelivery.deliveredAt
      } : null
    }));
  }

  async assignCourier(parcelId: string, courierId: string) {
    // First check if the parcel exists
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId }
    });

    if (!parcel) {
      throw new Error(`Parcel with ID ${parcelId} not found`);
    }

    // Check if the courier exists
    const courier = await this.prisma.user.findUnique({
      where: { id: courierId, role: 'COURIER' }
    });

    if (!courier) {
      throw new Error(`Courier with ID ${courierId} not found`);
    }

    const updatedParcel = await this.prisma.parcel.update({
      where: { id: parcelId },
      data: { 
        courierId,
        currentStatus: 'IN_TRANSIT' // Automatically change status to IN_TRANSIT when courier is assigned
      },
    });

    // Trigger notifications for courier assignment
    await this.notificationTriggerService.notifyCourierAssignment(parcelId, courierId);

    // Create a log entry for the courier assignment
    await this.createLog({
      action: 'COURIER_ASSIGNED',
      details: `Courier ${courier.firstName} ${courier.lastName} assigned to parcel ${parcelId}`,
      userId: courierId
    });

    return updatedParcel;
  }

  // Users
  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      include: {
        _count: {
          select: {
            parcelsSent: true,
            parcelsToReceive: true
          }
        }
      }
    });
    
    return users.map(user => ({
      ...user,
      parcelsCount: user._count.parcelsSent + user._count.parcelsToReceive
    }));
  }

  // Couriers
  async getAllCouriers() {
    const couriers = await this.prisma.user.findMany({ 
      where: { role: 'COURIER' },
      include: {
        _count: {
          select: {
            courierParcels: true
          }
        }
      }
    });
    
    return couriers.map(courier => ({
      id: courier.id,
      firstName: courier.firstName,
      lastName: courier.lastName,
      email: courier.email,
      phone: courier.phone,
      status: 'active', // Default status - you can add a status field to the User model if needed
      assignedParcels: courier._count.courierParcels,
      rating: 4.5 // Default rating - you can add a rating field to the User model if needed
    }));
  }

  // Dashboard Stats
  async getDashboardStats() {
    const [
      totalParcels,
      pendingParcels,
      inTransitParcels,
      deliveredParcels,
      cancelledParcels,
      totalUsers,
      totalCouriers
    ] = await Promise.all([
      this.prisma.parcel.count(),
      this.prisma.parcel.count({ where: { currentStatus: 'PENDING' } }),
      this.prisma.parcel.count({ where: { currentStatus: 'IN_TRANSIT' } }),
      this.prisma.parcel.count({ where: { currentStatus: 'DELIVERED' } }),
      this.prisma.parcel.count({ where: { currentStatus: 'CANCELLED' } }),
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({ where: { role: 'COURIER' } })
    ]);

    return {
      total: totalParcels,
      pending: pendingParcels,
      inTransit: inTransitParcels,
      delivered: deliveredParcels,
      cancelled: cancelledParcels,
      totalUsers,
      totalCouriers
    };
  }

  // Recent Parcels
  async getRecentParcels() {
    const parcels = await this.prisma.parcel.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: true,
        receiver: true,
        pickupLocation: true,
        deliveryLocation: true,
      },
    });
    
    return parcels.map(parcel => ({
      id: parcel.id,
      trackingNumber: parcel.id, // Using ID as tracking number for now
      senderName: `${parcel.sender.firstName} ${parcel.sender.lastName}`,
      receiverName: `${parcel.receiver.firstName} ${parcel.receiver.lastName}`,
      destination: parcel.deliveryLocation.address,
      status: parcel.currentStatus,
      createdAt: parcel.createdAt,
      weight: parcel.weight,
      amount: parcel.price
    }));
  }

  // Recent Users
  async getRecentUsers() {
    return this.prisma.user.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      where: { role: 'USER' }
    });
  }

  // Logs
  async getLogs() {
    const logs = await this.prisma.log.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return logs.map(log => ({
      id: log.id,
      date: log.createdAt,
      user: log.user ? `${log.user.firstName} ${log.user.lastName} (${log.user.email})` : 'System',
      action: log.action,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent
    }));
  }

  async createLog(data: {
    userId?: string;
    action: string;
    details: string;
    ipAddress?: string;
    userAgent?: string;
  }) {
    return this.prisma.log.create({
      data
    });
  }

  async createSampleLogs() {
    // Create some sample logs for testing
    const sampleLogs = [
      {
        action: 'LOGIN',
        details: 'Admin user logged in successfully',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        action: 'PARCEL_CREATED',
        details: 'New parcel created with tracking number SEND0012345678',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        action: 'USER_CREATED',
        details: 'New user account created: john.doe@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        action: 'STATUS_CHANGE',
        details: 'Parcel status updated from PENDING to IN_TRANSIT',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        action: 'UPDATE',
        details: 'User profile updated: jane.smith@example.com',
        ipAddress: '192.168.1.100',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    ];

    for (const logData of sampleLogs) {
      await this.prisma.log.create({
        data: logData
      });
    }

    return { message: 'Sample logs created successfully' };
  }

  // Analytics
  async getAnalytics() {
    // Get current date and calculate date ranges
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastDay = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get parcel statistics
    const [
      totalParcels,
      parcelsThisMonth,
      parcelsThisWeek,
      parcelsToday,
      pendingParcels,
      inTransitParcels,
      deliveredParcels,
      cancelledParcels
    ] = await Promise.all([
      this.prisma.parcel.count(),
      this.prisma.parcel.count({
        where: { createdAt: { gte: lastMonth } }
      }),
      this.prisma.parcel.count({
        where: { createdAt: { gte: lastWeek } }
      }),
      this.prisma.parcel.count({
        where: { createdAt: { gte: lastDay } }
      }),
      this.prisma.parcel.count({ where: { currentStatus: 'PENDING' } }),
      this.prisma.parcel.count({ where: { currentStatus: 'IN_TRANSIT' } }),
      this.prisma.parcel.count({ where: { currentStatus: 'DELIVERED' } }),
      this.prisma.parcel.count({ where: { currentStatus: 'CANCELLED' } })
    ]);

    // Get user statistics
    const [
      totalUsers,
      newUsersThisMonth,
      newUsersThisWeek,
      newUsersToday,
      totalCouriers,
      activeCouriers
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'USER' } }),
      this.prisma.user.count({
        where: {
          role: 'USER',
          createdAt: { gte: lastMonth }
        }
      }),
      this.prisma.user.count({
        where: {
          role: 'USER',
          createdAt: { gte: lastWeek }
        }
      }),
      this.prisma.user.count({
        where: {
          role: 'USER',
          createdAt: { gte: lastDay }
        }
      }),
      this.prisma.user.count({ where: { role: 'COURIER' } }),
      this.prisma.parcel.groupBy({
        by: ['courierId'],
        where: {
          courierId: { not: null },
          createdAt: { gte: lastMonth }
        }
      })
    ]);

    // Get revenue statistics
    const revenueData = await this.prisma.parcel.aggregate({
      _sum: { price: true },
      _avg: { price: true },
      where: { currentStatus: 'DELIVERED' }
    });

    const monthlyRevenue = await this.prisma.parcel.aggregate({
      _sum: { price: true },
      where: {
        currentStatus: 'DELIVERED',
        createdAt: { gte: lastMonth }
      }
    });

    // Get parcel status distribution for chart
    const statusDistribution = await this.prisma.parcel.groupBy({
      by: ['currentStatus'],
      _count: { currentStatus: true }
    });

    // Get monthly parcel trends
    const monthlyTrends = await this.prisma.parcel.groupBy({
      by: ['createdAt'],
      _count: { id: true },
      where: {
        createdAt: { gte: lastMonth }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    // Get top locations
    const topPickupLocations = await this.prisma.parcel.groupBy({
      by: ['pickupLocationId'],
      _count: { pickupLocationId: true },
      orderBy: {
        _count: {
          pickupLocationId: 'desc'
        }
      },
      take: 5
    });

    const topDeliveryLocations = await this.prisma.parcel.groupBy({
      by: ['deliveryLocationId'],
      _count: { deliveryLocationId: true },
      orderBy: {
        _count: {
          deliveryLocationId: 'desc'
        }
      },
      take: 5
    });

    // Get location details for top locations
    const pickupLocationDetails = await Promise.all(
      topPickupLocations.map(async (location) => {
        const locationData = await this.prisma.location.findUnique({
          where: { id: location.pickupLocationId }
        });
        return {
          location: locationData?.address || 'Unknown',
          count: location._count.pickupLocationId
        };
      })
    );

    const deliveryLocationDetails = await Promise.all(
      topDeliveryLocations.map(async (location) => {
        const locationData = await this.prisma.location.findUnique({
          where: { id: location.deliveryLocationId }
        });
        return {
          location: locationData?.address || 'Unknown',
          count: location._count.deliveryLocationId
        };
      })
    );

    return {
      overview: {
        totalParcels,
        totalUsers,
        totalCouriers,
        totalRevenue: revenueData._sum.price || 0,
        averageRevenue: revenueData._avg.price || 0
      },
      trends: {
        parcelsThisMonth,
        parcelsThisWeek,
        parcelsToday,
        newUsersThisMonth,
        newUsersThisWeek,
        newUsersToday,
        monthlyRevenue: monthlyRevenue._sum.price || 0
      },
      status: {
        pending: pendingParcels,
        inTransit: inTransitParcels,
        delivered: deliveredParcels,
        cancelled: cancelledParcels
      },
      charts: {
        statusDistribution: statusDistribution.map(item => ({
          status: item.currentStatus,
          count: item._count.currentStatus
        })),
        monthlyTrends: monthlyTrends.map(item => ({
          date: item.createdAt,
          count: item._count.id
        }))
      },
      locations: {
        topPickup: pickupLocationDetails,
        topDelivery: deliveryLocationDetails
      },
      performance: {
        activeCouriers: activeCouriers.length,
        deliveryRate: deliveredParcels > 0 ? (deliveredParcels / totalParcels) * 100 : 0,
        averageDeliveryTime: 2.5 // This would need more complex calculation
      }
    };
  }

  async getCourierLocation(parcelId: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        courier: true
      }
    });

    if (!parcel || !parcel.courierId) {
      return { error: 'No courier assigned to this parcel' };
    }

    // Get the courier's latest location from the database
    const courierLocation = await this.prisma.courierLocation.findFirst({
      where: { courierId: parcel.courierId },
      orderBy: { timestamp: 'desc' }
    });

    if (!courierLocation) {
      return { 
        courierId: parcel.courierId,
        courierName: `${parcel.courier?.firstName} ${parcel.courier?.lastName}`,
        error: 'No location data available for this courier'
      };
    }

    return {
      courierId: parcel.courierId,
      courierName: `${parcel.courier?.firstName} ${parcel.courier?.lastName}`,
      location: {
        latitude: courierLocation.latitude,
        longitude: courierLocation.longitude,
        address: courierLocation.address || 'Location updated',
        timestamp: courierLocation.timestamp.toISOString()
      }
    };
  }

  async getParcelTrackingHistory(parcelId: string) {
    const parcel = await this.prisma.parcel.findUnique({
      where: { id: parcelId },
      include: {
        pickupLocation: true,
        deliveryLocation: true
      }
    });

    if (!parcel) {
      return [];
    }

    // Create tracking history based on parcel status and timestamps
    const history = [
      {
        id: '1',
        parcelId: parcelId,
        status: 'PENDING',
        location: parcel.pickupLocation?.address || 'Pickup Location',
        timestamp: parcel.createdAt,
        description: 'Parcel created and ready for pickup'
      }
    ];

    if (parcel.currentStatus !== 'PENDING') {
      history.push({
        id: '2',
        parcelId: parcelId,
        status: parcel.currentStatus,
        location: parcel.currentStatus === 'DELIVERED' 
          ? (parcel.deliveryLocation?.address || 'Delivery Location')
          : 'En route to destination',
        timestamp: parcel.updatedAt,
        description: `Parcel ${parcel.currentStatus.toLowerCase()}`
      });
    }

    return history;
  }
}

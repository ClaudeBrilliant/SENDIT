import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateReviewDto {
  userId: string;
  parcelId: string;
  rating: number;
  comment: string;
}

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllReviews() {
    const reviews = await this.prisma.review.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        parcel: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      parcelId: review.parcelId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: `${review.user.firstName} ${review.user.lastName}`,
      parcelTrackingNumber: review.parcel.id
    }));
  }

  async getReviewsByParcel(parcelId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        parcelId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        parcel: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      parcelId: review.parcelId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: `${review.user.firstName} ${review.user.lastName}`,
      parcelTrackingNumber: review.parcel.id
    }));
  }

  async getReviewsByUser(userId: string) {
    const reviews = await this.prisma.review.findMany({
      where: {
        userId
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        parcel: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      parcelId: review.parcelId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: `${review.user.firstName} ${review.user.lastName}`,
      parcelTrackingNumber: review.parcel.id
    }));
  }

  async createReview(createReviewDto: CreateReviewDto) {
    // Check if user has already reviewed this parcel
    const existingReview = await this.prisma.review.findFirst({
      where: {
        userId: createReviewDto.userId,
        parcelId: createReviewDto.parcelId
      }
    });

    if (existingReview) {
      throw new Error('User has already reviewed this parcel');
    }

    // Check if parcel exists and is delivered
    const parcel = await this.prisma.parcel.findUnique({
      where: {
        id: createReviewDto.parcelId
      }
    });

    if (!parcel) {
      throw new Error('Parcel not found');
    }

    if (parcel.currentStatus !== 'DELIVERED') {
      throw new Error('Can only review delivered parcels');
    }

    const review = await this.prisma.review.create({
      data: {
        userId: createReviewDto.userId,
        parcelId: createReviewDto.parcelId,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        parcel: {
          select: {
            id: true
          }
        }
      }
    });

    return {
      id: review.id,
      userId: review.userId,
      parcelId: review.parcelId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      userName: `${review.user.firstName} ${review.user.lastName}`,
      parcelTrackingNumber: review.parcel.id
    };
  }
} 
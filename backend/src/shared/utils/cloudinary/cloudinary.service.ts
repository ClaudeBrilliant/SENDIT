import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';

export enum SenditUploadType {
  USER_PROFILE = 'user_profile',
  PARCEL_IMAGE = 'parcel_image',
  PROOF_OF_DELIVERY = 'proof_of_delivery',
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  original_filename: string;
  bytes: number;
  format: string;
  resource_type: string;
  created_at: string;
  width?: number;
  height?: number;
  folder: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
      api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
    });
    this.logger.log('Cloudinary service initialized successfully');
  }

  private getUploadConfig(uploadType: SenditUploadType) {
    switch (uploadType) {
      case SenditUploadType.USER_PROFILE:
        return {
          maxSizeBytes: 2 * 1024 * 1024, // 2MB
          allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          folder: 'sendit/users/profiles',
          transformations: {
            width: 400,
            height: 400,
            crop: 'fill',
            gravity: 'face',
            quality: 'auto',
            format: 'auto',
          },
        };
      case SenditUploadType.PARCEL_IMAGE:
        return {
          maxSizeBytes: 8 * 1024 * 1024, // 8MB
          allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
          folder: 'sendit/parcels/images',
          transformations: {
            width: 1200,
            height: 800,
            crop: 'fill',
            quality: 'auto',
            format: 'auto',
          },
        };
      case SenditUploadType.PROOF_OF_DELIVERY:
        return {
          maxSizeBytes: 4 * 1024 * 1024, // 4MB
          allowedFormats: ['jpg', 'jpeg', 'png', 'pdf'],
          folder: 'sendit/parcels/proof',
          transformations: {
            width: 800,
            height: 600,
            crop: 'fit',
            quality: 'auto',
            format: 'auto',
          },
        };
      default:
        throw new BadRequestException('Invalid upload type');
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    uploadType: SenditUploadType,
    entityId?: string
  ): Promise<CloudinaryUploadResult> {
    const config = this.getUploadConfig(uploadType);
    if (!config.allowedFormats.includes(file.mimetype.split('/')[1])) {
      throw new BadRequestException('Invalid file format');
    }
    if (file.size > config.maxSizeBytes) {
      throw new BadRequestException('File too large');
    }
    
    const folder = config.folder + (entityId ? `/${entityId}` : '');
    
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          transformation: config.transformations,
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) {
            reject(new BadRequestException('Cloudinary upload failed'));
          } else if (result) {
            resolve(result as unknown as CloudinaryUploadResult);
          } else {
            reject(new BadRequestException('Cloudinary upload failed'));
          }
        }
      );
      
      uploadStream.end(file.buffer);
    });
  }

  async deleteFile(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId);
  }

  getUrl(publicId: string, secure = true): string {
    return cloudinary.url(publicId, { secure });
  }
}

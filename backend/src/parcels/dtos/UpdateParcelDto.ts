/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsNumber, IsOptional, IsUUID, Min } from 'class-validator';

export class UpdateParcelDto {
  @IsUUID()
  @IsOptional()
  senderId?: string;

  @IsUUID()
  @IsOptional()
  receiverId?: string;

  @IsUUID()
  @IsOptional()
  courierId?: string;

  @IsNumber()
  @Min(0.1)
  @IsOptional()
  weight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsUUID()
  @IsOptional()
  pickupLocationId?: string;

  @IsUUID()
  @IsOptional()
  deliveryLocationId?: string;

  @IsUUID()
  @IsOptional()
  currentStatusId?: string;
}

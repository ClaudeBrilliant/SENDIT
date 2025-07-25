import { IsOptional, IsString, IsUUID, Min, IsNumber } from 'class-validator';

export class CreateParcelDto {
  @IsUUID()
  senderId: string;

  @IsUUID()
  receiverId: string;

  @IsOptional()
  @IsUUID()
  courierId?: string;

  @IsNumber()
  @Min(0.1)
  weight: number;

  @IsNumber()
  @Min(0)
  price: number;

  @IsString()
  pickupAddress: string;

  @IsString()
  deliveryAddress: string;

  @IsString()
  statusName: string;
}

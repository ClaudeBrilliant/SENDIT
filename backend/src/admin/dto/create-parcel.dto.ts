import { IsString, IsNumber, IsPositive, IsEmail, IsOptional, Matches } from 'class-validator';

export class CreateParcelDto {
  // Sender Information
  @IsString()
  senderName: string;

  @IsEmail()
  senderEmail: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Phone number must contain only numbers, spaces, hyphens, and parentheses' })
  senderPhone: string;

  @IsString()
  senderAddress: string;

  // Receiver Information
  @IsString()
  receiverName: string;

  @IsEmail()
  receiverEmail: string;

  @IsString()
  @Matches(/^[0-9+\-\s()]+$/, { message: 'Phone number must contain only numbers, spaces, hyphens, and parentheses' })
  receiverPhone: string;

  @IsString()
  receiverAddress: string;

  // Package Information
  @IsNumber()
  @IsPositive()
  weight: number;

  @IsNumber()
  @IsPositive()
  price: number;

  @IsOptional()
  @IsString()
  packageDescription?: string;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsString()
  deliveryType?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @IsOptional()
  insurance?: boolean;
} 
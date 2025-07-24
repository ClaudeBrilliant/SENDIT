/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
}

export interface WelcomeEmailContext {
  name: string;
  email: string;
  supportEmail?: string;
  loginUrl?: string;
}

export interface ParcelInfo {
  trackingNumber: string;
  senderName?: string;
  receiverName?: string;
  pickupLocation?: string;
  deliveryLocation?: string;
}

@Injectable()
export class MailerService {
  private readonly logger = new Logger(MailerService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get<string>('SMTP_PORT', '587')),
      secure: this.configService.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        rejectUnauthorized: false,
      },
    };
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.logger.log('Email transporter initialized successfully');
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.get<string>(
          'SMTP_FROM',
          'no-reply@sendit.com',
        ),
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      };
      const result = await this.transporter.sendMail(mailOptions);
      this.logger.log(
        `Email sent successfully to ${options.to}: ${result.messageId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email to ${options.to}: ${error.message}`,
      );
    }
  }

  async sendWelcomeEmail(
    to: string,
    context: WelcomeEmailContext,
  ): Promise<void> {
    const html = `<h2>Welcome to SendIT, ${context.name}!</h2>
      <p>Your account (${context.email}) has been created.</p>
      <p>You can now log in and start sending parcels.</p>
      <p>If you have any questions, contact us at ${context.supportEmail || 'support@sendit.com'}.</p>
      <p><a href="${context.loginUrl || 'http://localhost:3000/login'}">Login to SendIT</a></p>`;
    await this.sendEmail({
      to,
      subject: 'Welcome to SendIT',
      html,
    });
  }

  async sendStatusUpdateEmail(
    to: string,
    parcel: ParcelInfo,
    newStatus: string,
  ): Promise<void> {
    const html = `<h2>Parcel Status Update</h2>
      <p>Your parcel <b>${parcel.trackingNumber}</b> status has changed to: <b>${newStatus}</b>.</p>
      <p>Pickup: ${parcel.pickupLocation || 'N/A'}<br>Destination: ${parcel.deliveryLocation || 'N/A'}</p>
      <p>View details in your SendIT account.</p>`;
    await this.sendEmail({
      to,
      subject: 'Parcel Status Update',
      html,
    });
  }

  async sendDeliveryNotification(
    to: string,
    parcel: ParcelInfo,
  ): Promise<void> {
    const html = `<h2>Parcel Delivered!</h2>
      <p>Your parcel <b>${parcel.trackingNumber}</b> has been delivered.</p>
      <p>Thank you for using SendIT.</p>`;
    await this.sendEmail({
      to,
      subject: 'Parcel Delivered',
      html,
    });
  }

  async sendOrderCreatedEmail(to: string, parcel: ParcelInfo): Promise<void> {
    const html = `<h2>Parcel Order Created</h2>
      <p>A new parcel order <b>${parcel.trackingNumber}</b> has been created for you.</p>
      <p>Pickup: ${parcel.pickupLocation || 'N/A'}<br>Destination: ${parcel.deliveryLocation || 'N/A'}</p>
      <p>Track your parcel in your SendIT account.</p>`;
    await this.sendEmail({
      to,
      subject: 'Parcel Order Created',
      html,
    });
  }
}

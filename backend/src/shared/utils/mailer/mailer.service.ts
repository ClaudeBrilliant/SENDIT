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
  private isEmailConfigured = false;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    // Check for both SMTP_ and EMAIL_ naming conventions
    const smtpUser = this.configService.get<string>('SMTP_USER') || this.configService.get<string>('EMAIL_USER');
    const smtpPass = this.configService.get<string>('SMTP_PASS') || this.configService.get<string>('EMAIL_PASS');

    // Debug logging
    this.logger.debug(`SMTP_USER: ${this.configService.get<string>('SMTP_USER') ? 'SET' : 'NOT SET'}`);
    this.logger.debug(`EMAIL_USER: ${this.configService.get<string>('EMAIL_USER') ? 'SET' : 'NOT SET'}`);
    this.logger.debug(`SMTP_PASS: ${this.configService.get<string>('SMTP_PASS') ? 'SET' : 'NOT SET'}`);
    this.logger.debug(`EMAIL_PASS: ${this.configService.get<string>('EMAIL_PASS') ? 'SET' : 'NOT SET'}`);

    // Check if SMTP credentials are configured
    if (!smtpUser || !smtpPass) {
      this.logger.warn('SMTP credentials not configured. Email sending will be disabled.');
      this.logger.warn('Please set SMTP_USER/EMAIL_USER and SMTP_PASS/EMAIL_PASS environment variables.');
      this.isEmailConfigured = false;
      return;
    }

    const smtpConfig = {
      host: this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com'),
      port: parseInt(this.configService.get<string>('SMTP_PORT', '587')),
      secure: this.configService.get<string>('SMTP_SECURE', 'false') === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    };
    
    this.transporter = nodemailer.createTransport(smtpConfig);
    this.isEmailConfigured = true;
    this.logger.log('Email transporter initialized successfully');
    this.logger.log(`Using SMTP host: ${smtpConfig.host}:${smtpConfig.port}`);
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    if (!this.isEmailConfigured) {
      this.logger.warn(`Email sending disabled. Would have sent to ${options.to}: ${options.subject}`);
      return;
    }

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

import { Injectable } from '@nestjs/common';
import { NotificationTriggerService } from '../notifications/notification-trigger.service';
import { MailerService } from '../shared/utils/mailer/mailer.service';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  preferredContact: string;
}

@Injectable()
export class ContactService {
  constructor(
    private readonly notificationTriggerService: NotificationTriggerService,
    private readonly mailerService: MailerService,
  ) {}

  async submitContactForm(contactData: ContactFormData) {
    try {
      // Trigger admin notifications
      await this.notificationTriggerService.notifyAdminContactForm(contactData);

      // Send confirmation email to the user
      await this.mailerService.sendEmail({
        to: contactData.email,
        subject: 'Thank you for contacting SendIT',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #FB9F3E 0%, #e88a35 100%); padding: 30px; border-radius: 10px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">Thank you for contacting us!</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Dear <strong>${contactData.name}</strong>,</p>
              
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">We have received your message and will get back to you within 24 hours.</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #FB9F3E; margin-top: 0;">Your Message Details:</h3>
                <p><strong>Subject:</strong> ${contactData.subject}</p>
                <p><strong>Message:</strong></p>
                <p style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #FB9F3E;">${contactData.message}</p>
                <p><strong>Preferred Contact:</strong> ${contactData.preferredContact}</p>
                ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
              </div>
              
              <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Our team will review your inquiry and respond via your preferred contact method.</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="http://localhost:4200" style="background: #FB9F3E; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Visit SendIT</a>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666; margin-bottom: 10px;">Best regards,</p>
              <p style="font-size: 14px; color: #666; margin-bottom: 10px;"><strong>The SendIT Team</strong></p>
              
              <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="font-size: 12px; color: #666; margin: 0;">
                  <strong>Contact Information:</strong><br>
                  📧 support@sendit.com<br>
                  📞 +1 (555) 123-4567<br>
                  📍 123 Delivery Street, City, State 12345
                </p>
              </div>
            </div>
          </div>
        `,
      });

      // Send notification email to admin
      await this.mailerService.sendEmail({
        to: 'claudebrilliant@gmail.com', // Admin email address
        subject: `New Contact Form Submission: ${contactData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #dc3545; padding: 30px; border-radius: 10px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">New Contact Form Submission</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Contact Form Details:</h2>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Name:</strong> ${contactData.name}</p>
                <p><strong>Email:</strong> ${contactData.email}</p>
                ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
                <p><strong>Subject:</strong> ${contactData.subject}</p>
                <p><strong>Preferred Contact:</strong> ${contactData.preferredContact}</p>
                <p><strong>Message:</strong></p>
                <div style="background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #dc3545;">
                  ${contactData.message}
                </div>
              </div>
              
              <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; margin-top: 20px;">
                <p style="margin: 0; color: #1976d2;">
                  <strong>Action Required:</strong> Please respond to this inquiry within 24 hours.
                </p>
              </div>
              
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
              
              <p style="font-size: 14px; color: #666; margin: 0;">
                This is an automated notification from the SendIT contact form system.
              </p>
            </div>
          </div>
        `,
      });

      return {
        success: true,
        message: 'Thank you for your message! We\'ll get back to you within 24 hours.',
      };
    } catch (error) {
      console.error('Error submitting contact form:', error);
      return {
        success: false,
        message: 'Failed to submit contact form. Please try again.',
      };
    }
  }
} 
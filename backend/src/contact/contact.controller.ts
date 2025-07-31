import { Controller, Post, Body } from '@nestjs/common';
import { ContactService } from './contact.service';

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  preferredContact: string;
}

@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Post('submit')
  async submitContactForm(@Body() contactData: ContactFormData) {
    return this.contactService.submitContactForm(contactData);
  }
} 
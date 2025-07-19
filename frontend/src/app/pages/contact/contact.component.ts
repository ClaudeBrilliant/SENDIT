import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NavComponent, FooterComponent],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  contactForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  contactInfo = {
    phone: '+1 (555) 123-4567',
    email: 'support@sendit.com',
    address: '123 Delivery Street, City, State 12345',
    hours: 'Monday - Friday: 8:00 AM - 8:00 PM\nSaturday: 9:00 AM - 6:00 PM\nSunday: 10:00 AM - 4:00 PM'
  };

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]],
      preferredContact: ['email']
    });
  }

  onSubmit(): void {
    if (this.contactForm.valid) {
      this.isLoading = true;
      this.successMessage = '';
      this.errorMessage = '';
      
      // Simulate API call
      setTimeout(() => {
        const formData = this.contactForm.value;
        console.log('Contact form submitted:', formData);
        
        this.successMessage = 'Thank you for your message! We\'ll get back to you within 24 hours.';
        this.contactForm.reset();
        this.isLoading = false;
      }, 1500);
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
      if (field.errors['minlength']) {
        const minLength = field.errors['minlength'].requiredLength;
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${minLength} characters`;
      }
      if (field.errors['pattern'] && fieldName === 'phone') {
        return 'Please enter a valid phone number';
      }
    }
    return '';
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  formatHours(hours: string): string {
    return hours.replace(/\n/g, '<br>');
  }
} 
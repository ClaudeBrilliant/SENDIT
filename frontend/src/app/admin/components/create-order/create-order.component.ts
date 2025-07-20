import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-order',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent implements OnInit {
  orderForm: FormGroup;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Weight categories for pricing
  weightCategories = [
    { value: 'light', label: 'Light (0-1kg)', price: 500 },
    { value: 'medium', label: 'Medium (1-5kg)', price: 800 },
    { value: 'heavy', label: 'Heavy (5-10kg)', price: 1200 },
    { value: 'extra_heavy', label: 'Extra Heavy (10kg+)', price: 2000 }
  ];

  // Delivery options
  deliveryOptions = [
    { value: 'standard', label: 'Standard (3-5 days)', multiplier: 1 },
    { value: 'express', label: 'Express (1-2 days)', multiplier: 1.5 },
    { value: 'same_day', label: 'Same Day', multiplier: 2.5 }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.orderForm = this.fb.group({
      // Sender Information
      senderName: ['', [Validators.required, Validators.minLength(2)]],
      senderEmail: ['', [Validators.required, Validators.email]],
      senderPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      senderAddress: ['', [Validators.required, Validators.minLength(10)]],

      // Receiver Information
      receiverName: ['', [Validators.required, Validators.minLength(2)]],
      receiverEmail: ['', [Validators.required, Validators.email]],
      receiverPhone: ['', [Validators.required, Validators.pattern(/^[0-9+\-\s()]+$/)]],
      receiverAddress: ['', [Validators.required, Validators.minLength(10)]],

      // Package Details
      packageDescription: ['', [Validators.required, Validators.minLength(5)]],
      weightCategory: ['light', Validators.required],
      weight: ['', [Validators.required, Validators.min(0.1), Validators.max(50)]],
      dimensions: this.fb.group({
        length: ['', [Validators.required, Validators.min(1)]],
        width: ['', [Validators.required, Validators.min(1)]],
        height: ['', [Validators.required, Validators.min(1)]]
      }),

      // Delivery Options
      deliveryType: ['standard', Validators.required],
      pickupDate: ['', Validators.required],
      specialInstructions: [''],

      // Payment
      paymentMethod: ['cash_on_delivery', Validators.required],
      insurance: [false]
    });
  }

  ngOnInit(): void {
    // Set default pickup date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.orderForm.patchValue({
      pickupDate: tomorrow.toISOString().split('T')[0]
    });

    // Calculate price when form changes
    this.orderForm.valueChanges.subscribe(() => {
      this.calculatePrice();
    });
  }

  // Calculate total price based on weight category and delivery type
  calculatePrice(): number {
    const weightCategory = this.orderForm.get('weightCategory')?.value;
    const deliveryType = this.orderForm.get('deliveryType')?.value;
    const insurance = this.orderForm.get('insurance')?.value;

    const weightPrice = this.weightCategories.find(w => w.value === weightCategory)?.price || 0;
    const deliveryMultiplier = this.deliveryOptions.find(d => d.value === deliveryType)?.multiplier || 1;
    const insuranceCost = insurance ? 200 : 0;

    return (weightPrice * deliveryMultiplier) + insuranceCost;
  }

  // Get formatted price
  getFormattedPrice(): string {
    return `KSh ${this.calculatePrice().toLocaleString()}`;
  }

  // Get weight category label
  getWeightCategoryLabel(value: string): string {
    return this.weightCategories.find(w => w.value === value)?.label || '';
  }

  // Get delivery option label
  getDeliveryOptionLabel(value: string): string {
    return this.deliveryOptions.find(d => d.value === value)?.label || '';
  }

  // Form validation helpers
  isFieldInvalid(fieldName: string): boolean {
    const field = this.orderForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.orderForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return 'This field is required';
      if (field.errors['email']) return 'Please enter a valid email';
      if (field.errors['minlength']) return `Minimum length is ${field.errors['minlength'].requiredLength} characters`;
      if (field.errors['pattern']) return 'Please enter a valid phone number';
      if (field.errors['min']) return `Minimum value is ${field.errors['min'].min}`;
      if (field.errors['max']) return `Maximum value is ${field.errors['max'].max}`;
    }
    return '';
  }

  // Handle form submission
  onSubmit(): void {
    if (this.orderForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Simulate API call
      setTimeout(() => {
        const orderData = {
          ...this.orderForm.value,
          trackingNumber: this.generateTrackingNumber(),
          totalPrice: this.calculatePrice(),
          status: 'PENDING',
          createdAt: new Date().toISOString()
        };

        console.log('Creating order:', orderData);
        
        // Simulate success
        this.isLoading = false;
        this.successMessage = `Order created successfully! Tracking number: ${orderData.trackingNumber}`;
        
        // Reset form after success
        setTimeout(() => {
          this.orderForm.reset();
          this.ngOnInit(); // Re-initialize with defaults
        }, 3000);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  // Generate tracking number
  generateTrackingNumber(): string {
    const prefix = 'SEND';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  // Mark all form fields as touched to show validation errors
  markFormGroupTouched(): void {
    Object.keys(this.orderForm.controls).forEach(key => {
      const control = this.orderForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      }
    });
  }

  // Navigation methods
  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  goToOrders(): void {
    this.router.navigate(['/admin/orders']);
  }

  // Clear messages
  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }
}

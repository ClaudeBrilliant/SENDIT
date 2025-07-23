import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {
  services = [
    {
      id: 1,
      name: 'Standard Delivery',
      description: 'Reliable delivery within 3-5 business days',
      features: [
        'Package tracking',
        'Email notifications',
        'Insurance up to $100',
        'Signature confirmation available'
      ],
      price: 'Starting from $9.99',
      deliveryTime: '3-5 business days',
      popular: false
    },
    {
      id: 2,
      name: 'Express Delivery',
      description: 'Fast delivery within 1-2 business days',
      features: [
        'Priority handling',
        'Real-time tracking',
        'Insurance up to $500',
        'Signature confirmation included',
        'Priority customer support'
      ],
      price: 'Starting from $19.99',
      deliveryTime: '1-2 business days',
      popular: true
    },
    {
      id: 3,
      name: 'Same-Day Delivery',
      description: 'Ultra-fast delivery on the same day',
      features: [
        'Same-day pickup and delivery',
        'Live tracking with GPS',
        'Insurance up to $1000',
        'Signature confirmation required',
        'Dedicated support team',
        'Available in select areas'
      ],
      price: 'Starting from $39.99',
      deliveryTime: 'Same day',
      popular: false
    },
   
  ];

  additionalServices = [
    {
      name: 'Package Insurance',
      description: 'Additional coverage for valuable items',
      price: 'From $2.99'
    },
    {
      name: 'Signature Confirmation',
      description: 'Proof of delivery with recipient signature',
      price: 'From $3.99'
    },
    {
      name: 'Saturday Delivery',
      description: 'Weekend delivery service',
      price: 'From $5.99'
    },
    {
      name: 'Package Pickup',
      description: 'Convenient pickup from your location',
      price: 'From $4.99'
    }
  ];

  features = [
    {
      title: 'Real-Time Tracking',
      description: 'Track your packages in real-time with GPS location updates'
    },
    {
      title: 'Secure & Reliable',
      description: 'Your packages are handled with care and fully insured'
    },
    {
      title: 'Mobile App',
      description: 'Manage your shipments on the go with our mobile app'
    },
    {
      title: 'Eco-Friendly',
      description: 'We use sustainable packaging and carbon-neutral delivery'
    }
  ];

  testimonials = [
    {
      name: 'Sarah Johnson',
      company: 'E-commerce Store Owner',
      text: 'SendIT has transformed our delivery process. Fast, reliable, and our customers love the tracking updates!',
      rating: 5
    },
    {
      name: 'Mike Chen',
      company: 'Small Business Owner',
      text: 'The express delivery service is incredible. We can now offer same-day delivery to our local customers.',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      company: 'Online Seller',
      text: 'International shipping made easy! SendIT handles all the customs paperwork for us.',
      rating: 5
    }
  ];

  selectedService: any = null;

  selectService(service: any): void {
    this.selectedService = service;
  }

  closeModal(): void {
    this.selectedService = null;
  }

  getStars(rating: number): number[] {
    return Array(rating).fill(0);
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
} 
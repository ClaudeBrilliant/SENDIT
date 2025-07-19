import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

export interface ParcelDetails {
  trackingNumber: string;
  status: string;
  sender: string;
  receiver: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight: number;
  price: number;
  createdAt: string;
  estimatedDelivery: string;
}

@Component({
  selector: 'app-parcel-details',
  standalone: true,
  imports: [NgClass],
  templateUrl: './parcel-details.component.html',
  styleUrls: ['./parcel-details.component.css']
})
export class ParcelDetailsComponent {
  @Input() parcel: ParcelDetails = {
    trackingNumber: 'SEND123456',
    status: 'In Transit',
    sender: 'John Doe',
    receiver: 'Jane Smith',
    pickupAddress: '123 Main St, City, State',
    deliveryAddress: '456 Oak Ave, City, State',
    weight: 2.5,
    price: 29.99,
    createdAt: '2024-01-20 10:00',
    estimatedDelivery: '2024-01-25 16:00'
  };

  getStatusClass(status: string): string {
    switch (status) {
      case 'Pending': return 'status-pending';
      case 'In Transit': return 'status-in-transit';
      case 'Delivered': return 'status-delivered';
      case 'Cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }
}

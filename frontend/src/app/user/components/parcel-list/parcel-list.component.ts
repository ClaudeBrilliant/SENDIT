import { CommonModule, NgClass } from '@angular/common';
import { Component } from '@angular/core';

interface ParcelListItem {
  trackingNumber: string;
  status: string;
  receiver: string;
  createdAt: string;
}

@Component({
  selector: 'app-parcel-list',
  standalone: true,
  imports: [NgClass,CommonModule],
  templateUrl: './parcel-list.component.html',
  styleUrls: ['./parcel-list.component.css']
})
export class ParcelListComponent {
  parcels: ParcelListItem[] = [
    { trackingNumber: 'SEND123456', status: 'In Transit', receiver: 'Jane Smith', createdAt: '2024-01-20' },
    { trackingNumber: 'SEND789012', status: 'Delivered', receiver: 'Bob Johnson', createdAt: '2024-01-15' },
    { trackingNumber: 'SEND345678', status: 'Pending', receiver: 'Alice Brown', createdAt: '2024-01-23' }
  ];

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

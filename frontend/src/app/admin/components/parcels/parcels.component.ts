import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Parcel {
  trackingNumber: string;
  sender: string;
  receiver: string;
  status: string;
  createdAt: string;
}

@Component({
  selector: 'app-parcels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parcels.component.html',
  styleUrls: ['./parcels.component.css']
})
export class ParcelsComponent {
  parcels: Parcel[] = [
    { trackingNumber: 'SEND123456', sender: 'John Doe', receiver: 'Jane Smith', status: 'Delivered', createdAt: '2024-06-01' },
    { trackingNumber: 'SEND123457', sender: 'Alice Johnson', receiver: 'Bob Wilson', status: 'In Transit', createdAt: '2024-06-02' },
    { trackingNumber: 'SEND123458', sender: 'Carol Brown', receiver: 'David Lee', status: 'Pending', createdAt: '2024-06-03' },
    { trackingNumber: 'SEND123459', sender: 'Eve Adams', receiver: 'Frank Miller', status: 'Cancelled', createdAt: '2024-06-04' }
  ];
  viewParcel(parcel: Parcel) { alert('View: ' + parcel.trackingNumber); }
  editParcel(parcel: Parcel) { alert('Edit: ' + parcel.trackingNumber); }
  deleteParcel(parcel: Parcel) { alert('Delete: ' + parcel.trackingNumber); }
} 
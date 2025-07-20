import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-track-parcel',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './track-parcel.component.html',
  styleUrls: ['./track-parcel.component.css']
})
export class TrackParcelComponent {
  trackingNumber = '';
  found = false;
  status = '';
  history: { date: string, status: string }[] = [];
  pickupCoordinates: { lat: number, lng: number } | null = null;
  deliveryCoordinates: { lat: number, lng: number } | null = null;

  track() {
    // Mock tracking logic
    if (this.trackingNumber === 'SEND123456') {
      this.found = true;
      this.status = 'In Transit';
      this.history = [
        { date: '2024-01-20', status: 'Created' },
        { date: '2024-01-21', status: 'Picked Up' },
        { date: '2024-01-22', status: 'In Transit' }
      ];
      // Mock coordinates for demonstration
      this.pickupCoordinates = { lat: -1.286389, lng: 36.817223 }; // Nairobi
      this.deliveryCoordinates = { lat: -0.091702, lng: 34.767956 }; // Kisumu
    } else {
      this.found = false;
      this.status = '';
      this.history = [];
      this.pickupCoordinates = null;
      this.deliveryCoordinates = null;
    }
  }
}

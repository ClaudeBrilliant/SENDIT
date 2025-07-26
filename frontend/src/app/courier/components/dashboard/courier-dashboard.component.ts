import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './courier-dashboard.component.html',
  styleUrls: ['./courier-dashboard.component.css']
})
export class CourierDashboardComponent implements OnInit {
  courier = {
    id: '',
    name: '',
    email: '',
    avatar: '/assets/default-avatar.png',
  };

  stats = {
    assigned: 0,
    inTransit: 0,
    delivered: 0,
    cancelled: 0,
  };

  activeTab: 'assigned' | 'history' = 'assigned';

  assignedParcels: any[] = [];
  deliveryHistory: any[] = [];

  // Update functionality
  showUpdateModal = false;
  selectedParcel: any = null;
  updateForm = {
    location: '',
    status: 'PENDING'
  };

  statusOptions = [
    { value: 'PENDING', label: 'Pending' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // Get courier info from localStorage or user service
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.role === 'COURIER') {
      this.courier = {
        id: user.id,
        name: user.firstName ? user.firstName + ' ' + (user.lastName || '') : user.name || '',
        email: user.email,
        avatar: user.avatar || '/assets/default-avatar.png',
      };
      this.fetchAssignedParcels();
      this.fetchDeliveryHistory();
    }
  }

  fetchAssignedParcels() {
    this.http.get<any[]>(`/api/parcels/assigned?courierId=${this.courier.id}`).subscribe(parcels => {
      this.assignedParcels = parcels || [];
      this.stats.assigned = this.assignedParcels.length;
      this.stats.inTransit = this.assignedParcels.filter(p => p.status === 'IN_TRANSIT').length;
    });
  }

  fetchDeliveryHistory() {
    this.http.get<any[]>(`/api/parcels/history?courierId=${this.courier.id}`).subscribe(parcels => {
      this.deliveryHistory = parcels || [];
      this.stats.delivered = this.deliveryHistory.filter(p => p.status === 'DELIVERED').length;
      this.stats.cancelled = this.deliveryHistory.filter(p => p.status === 'CANCELLED').length;
    });
  }

  switchTab(tab: 'assigned' | 'history') {
    this.activeTab = tab;
  }

  // Update parcel location and status
  openUpdateModal(parcel: any) {
    this.selectedParcel = parcel;
    this.updateForm = {
      location: '',
      status: parcel.currentStatus || 'PENDING'
    };
    this.showUpdateModal = true;
  }

  closeUpdateModal() {
    this.showUpdateModal = false;
    this.selectedParcel = null;
  }

  updateParcelLocation() {
    if (!this.selectedParcel || !this.updateForm.location) {
      return;
    }

    const updateData = {
      location: this.updateForm.location,
      currentStatusId: this.updateForm.status
    };

    this.http.patch(`/api/courier/parcels/${this.selectedParcel.id}/location`, updateData)
      .subscribe({
        next: (response) => {
          console.log('Parcel updated successfully:', response);
          this.closeUpdateModal();
          this.fetchAssignedParcels(); // Refresh the list
          this.fetchDeliveryHistory(); // Refresh history
        },
        error: (error) => {
          console.error('Error updating parcel:', error);
          alert('Failed to update parcel. Please try again.');
        }
      });
  }

  // Get current location using browser geolocation
  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode to get address
          this.reverseGeocode(lat, lng);
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get current location. Please enter manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
    }
  }

  // Simple reverse geocoding (you might want to use a proper service like Google Maps API)
  reverseGeocode(lat: number, lng: number) {
    // For now, just use coordinates as location
    this.updateForm.location = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
} 
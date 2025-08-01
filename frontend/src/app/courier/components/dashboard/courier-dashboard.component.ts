import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from '../../../user/components/profile/profile.component';
import { NotificationService } from '../../../shared/services/notification.service';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ProfileComponent],
  templateUrl: './courier-dashboard.component.html',
  styleUrls: ['./courier-dashboard.component.css']
})
export class CourierDashboardComponent implements OnInit {
  courier = {
    id: '',
    firstName: '',
    lastName: '',
    email: '',
    profileImage: '',
    role: '',
    createdAt: '',
    updatedAt: ''
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

  showProfileModal = false;

  openProfileModal(): void {
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
    // Reload courier info from localStorage in case profile image was updated
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.role === 'COURIER') {
      this.courier = {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        profileImage: user.profileImage || '',
        role: user.role || '',
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || ''
      };
    }
  }

  constructor(
    private http: HttpClient,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Get courier info from localStorage or user service
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.role === 'COURIER') {
      this.courier = {
        id: user.id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        profileImage: user.profileImage || '',
        role: user.role || '',
        createdAt: user.createdAt || '',
        updatedAt: user.updatedAt || ''
      };
      this.fetchAssignedParcels();
      this.fetchDeliveryHistory();
      this.startLocationTracking(); // Start tracking courier location
    }
  }

  getCourierInitials(): string {
    const firstName = this.courier.firstName || '';
    const lastName = this.courier.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getAvatarColor(): string {
    if (!this.courier.id) return '#FB9F3E';
    const colors = ['#FB9F3E', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const index = this.courier.id.charCodeAt(0) % colors.length;
    return colors[index];
  }

  hasProfileImage(): boolean {
    return !!this.courier.profileImage;
  }

  fetchAssignedParcels() {
    this.http.get<any[]>(`http://localhost:3000/courier/assigned?courierId=${this.courier.id}`).subscribe({
      next: (parcels) => {
        console.log('Assigned parcels:', parcels);
        this.assignedParcels = parcels || [];
        this.stats.assigned = this.assignedParcels.length;
        this.stats.inTransit = this.assignedParcels.filter(p => p.currentStatus === 'IN_TRANSIT').length;
      },
      error: (error) => {
        console.error('Error fetching assigned parcels:', error);
        this.assignedParcels = [];
      }
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

    this.http.patch(`http://localhost:3000/courier/parcels/${this.selectedParcel.id}/location`, updateData)
      .subscribe({
        next: (response) => {
          console.log('Parcel updated successfully:', response);
          this.closeUpdateModal();
          this.fetchAssignedParcels(); // Refresh the list
          this.fetchDeliveryHistory(); // Refresh history
        },
        error: (error) => {
          console.error('Error updating parcel:', error);
          this.notificationService.error(
            'Update Failed',
            'Failed to update parcel. Please try again.'
          );
        }
      });
  }

  // Get current location using browser geolocation
  async getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Reverse geocode to get address
          try {
            const address = await this.reverseGeocode(lat, lng);
            this.updateForm.location = address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          } catch (error) {
            this.updateForm.location = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
          }
        },
        (error) => {
          console.error('Error getting location:', error);
          this.notificationService.warning(
            'Location Error',
            'Unable to get current location. Please enter manually.'
          );
        }
      );
    } else {
      this.notificationService.warning(
        'Geolocation Not Supported',
        'Geolocation is not supported by this browser.'
      );
    }
  }

  // Reverse geocode coordinates to get address
  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.display_name) {
        // Extract a shorter, more readable address
        const parts = data.display_name.split(', ');
        if (parts.length >= 3) {
          return `${parts[0]}, ${parts[1]}, ${parts[2]}`;
        }
        return data.display_name;
      }
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }

  // Update courier's current location
  updateCourierLocation(latitude: number, longitude: number, address: string) {
    const locationData = {
      courierId: this.courier.id,
      latitude: latitude,
      longitude: longitude,
      address: address
    };

    this.http.patch(`http://localhost:3000/courier/location`, locationData)
      .subscribe({
        next: (response) => {
          console.log('Courier location updated:', response);
        },
        error: (error) => {
          console.error('Error updating courier location:', error);
        }
      });
  }

  // Auto-update location periodically
  startLocationTracking() {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          
          // Get a real address using reverse geocoding
          try {
            const address = await this.reverseGeocode(lat, lng);
            this.updateCourierLocation(lat, lng, address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          } catch (error) {
            console.log('Could not get address, using coordinates');
            this.updateCourierLocation(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
          }
        },
        (error) => {
          console.error('Error tracking location:', error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000 // Update every 30 seconds
        }
      );
    }
  }

} 
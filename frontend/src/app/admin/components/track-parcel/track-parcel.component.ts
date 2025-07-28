import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ParcelService } from '../../../user/services/parcel.service';
import { latLng, tileLayer, marker, icon, MapOptions, Layer, polyline, LatLngBounds } from 'leaflet';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface NominatimResponse {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: {
    city?: string;
    county?: string;
    state?: string;
    country?: string;
  };
}

@Component({
  selector: 'app-admin-track-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule, LeafletModule],
  templateUrl: './track-parcel.component.html',
  styleUrls: ['./track-parcel.component.css']
})
export class AdminTrackParcelComponent implements OnInit {
  trackingNumber = '';
  found = false;
  status = '';
  history: { date: string, status: string, location?: string }[] = [];
  
  // Real place names
  pickupLocation = '';
  deliveryLocation = '';
  currentLocation = '';
  
  pickupCoordinates: { lat: number, lng: number } | null = null;
  deliveryCoordinates: { lat: number, lng: number } | null = null;
  currentCoordinates: { lat: number, lng: number } | null = null;

  mapOptions: MapOptions = {
    layers: [
      tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      })
    ],
    zoom: 7,
    center: latLng(-1.286389, 36.817223) // Default to Nairobi, Kenya
  };
  
  mapLayers: Layer[] = [];
  loading = false;
  error: string | null = null;

  // Parcel details
  parcelDetails: any = null;
  availableParcels: any[] = [];

  constructor(
    private adminService: AdminService,
    private parcelService: ParcelService
  ) {}

  ngOnInit(): void {
    // Component initialization
    console.log('Admin Track Parcel Component initialized');
    console.log('Map options:', this.mapOptions);
    this.loadAvailableParcels();
  }

  loadAvailableParcels() {
    this.adminService.getAllParcelIds().subscribe({
      next: (parcels) => {
        console.log('Available parcels for tracking:', parcels);
        this.availableParcels = parcels;
      },
      error: (error) => {
        console.error('Error loading available parcels:', error);
      }
    });
  }

  onParcelSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      this.trackingNumber = target.value;
      this.track();
      // Start periodic location updates for in-transit parcels
      this.startLocationUpdates();
    }
  }

  private locationUpdateInterval: any = null;

  startLocationUpdates() {
    // Clear any existing interval
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
    }

    // Update location every 30 seconds for in-transit parcels
    this.locationUpdateInterval = setInterval(async () => {
      if (this.found && this.parcelDetails && this.parcelDetails.currentStatus === 'IN_TRANSIT') {
        try {
          const courierLocation = await this.adminService.getCourierLocation(this.parcelDetails.id).toPromise();
          if (courierLocation && !courierLocation.error) {
            this.currentLocation = courierLocation.location.address;
            this.currentCoordinates = {
              lat: courierLocation.location.latitude,
              lng: courierLocation.location.longitude
            };
            
            // Try to get a more detailed address using reverse geocoding
            try {
              const detailedAddress = await this.reverseGeocode(courierLocation.location.latitude, courierLocation.location.longitude);
              if (detailedAddress) {
                this.currentLocation = detailedAddress;
              }
            } catch (geocodeError) {
              console.log('Could not get detailed address, using courier location');
            }
            
            await this.updateMap();
          }
        } catch (error) {
          console.log('Error updating courier location:', error);
        }
      }
    }, 30000); // 30 seconds
  }

  stopLocationUpdates() {
    if (this.locationUpdateInterval) {
      clearInterval(this.locationUpdateInterval);
      this.locationUpdateInterval = null;
    }
  }

  // Geocode a place name to coordinates using OpenStreetMap Nominatim
  async geocodePlace(placeName: string): Promise<{ lat: number, lng: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`;
      const response = await fetch(url);
      const data = await response.json();
      
      if (data && data.length > 0) {
        return {
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

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

  async track() {
    this.loading = true;
    this.error = null;
    this.found = false;
    this.status = '';
    this.history = [];
    this.pickupCoordinates = null;
    this.deliveryCoordinates = null;
    this.currentCoordinates = null;
    this.mapLayers = [];
    this.parcelDetails = null;
    
    try {
      console.log('Tracking parcel with number:', this.trackingNumber);
      
      // Try to get real parcel data first
      const parcel = await this.parcelService.trackParcel(this.trackingNumber).toPromise();
      
      console.log('Parcel found:', parcel);
      
      if (parcel) {
        this.found = true;
        this.parcelDetails = parcel;
        this.status = this.formatStatus(parcel.currentStatus);
        
        // Set locations from parcel data
        this.pickupLocation = parcel.pickupLocation || 'Pickup Location';
        this.deliveryLocation = parcel.deliveryLocation || 'Delivery Location';
        
        // Try to get courier location for real-time tracking
        if (parcel.currentStatus === 'IN_TRANSIT') {
          try {
            const courierLocation = await this.adminService.getCourierLocation(parcel.id).toPromise();
            if (courierLocation && !courierLocation.error) {
              this.currentLocation = courierLocation.location.address;
              this.currentCoordinates = {
                lat: courierLocation.location.latitude,
                lng: courierLocation.location.longitude
              };
              
              // Try to get a more detailed address using reverse geocoding
              try {
                const detailedAddress = await this.reverseGeocode(courierLocation.location.latitude, courierLocation.location.longitude);
                if (detailedAddress) {
                  this.currentLocation = detailedAddress;
                }
              } catch (geocodeError) {
                console.log('Could not get detailed address, using courier location');
              }
            } else {
              this.currentLocation = 'En route to destination';
            }
          } catch (error) {
            console.log('Could not get courier location, using default');
            this.currentLocation = 'En route to destination';
          }
        } else if (parcel.currentStatus === 'DELIVERED') {
          this.currentLocation = this.deliveryLocation;
        } else {
          this.currentLocation = this.pickupLocation;
        }
        
        // Geocode the places to get coordinates
        this.pickupCoordinates = await this.geocodePlace(this.pickupLocation);
        this.deliveryCoordinates = await this.geocodePlace(this.deliveryLocation);
        
        // Fallback coordinates for testing if geocoding fails
        if (!this.pickupCoordinates) {
          console.log('Geocoding failed for pickup location, using fallback coordinates');
          this.pickupCoordinates = { lat: -1.286389, lng: 36.817223 }; // Nairobi
        }
        if (!this.deliveryCoordinates) {
          console.log('Geocoding failed for delivery location, using fallback coordinates');
          this.deliveryCoordinates = { lat: -4.0435, lng: 39.6682 }; // Mombasa
        }
        
        if (parcel.currentStatus === 'IN_TRANSIT') {
          // For in-transit, create a midpoint between pickup and delivery
          if (this.pickupCoordinates && this.deliveryCoordinates) {
            this.currentCoordinates = {
              lat: (this.pickupCoordinates.lat + this.deliveryCoordinates.lat) / 2,
              lng: (this.pickupCoordinates.lng + this.deliveryCoordinates.lng) / 2
            };
          }
        } else {
          this.currentCoordinates = await this.geocodePlace(this.currentLocation);
        }

        // Get real tracking history
        try {
          const trackingHistory = await this.adminService.getParcelTrackingHistory(parcel.id).toPromise();
          this.history = (trackingHistory || []).map(item => ({
            date: new Date(item.timestamp).toLocaleDateString(),
            status: this.formatStatus(item.status),
            location: item.location
          }));
        } catch (error) {
          console.log('Could not get tracking history, using default');
          // Create default tracking history
          this.history = [
            { 
              date: new Date(parcel.createdAt).toLocaleDateString(), 
              status: 'Created', 
              location: this.pickupLocation 
            }
          ];

          if (parcel.currentStatus !== 'PENDING') {
            this.history.push({
              date: new Date(parcel.updatedAt).toLocaleDateString(),
              status: this.formatStatus(parcel.currentStatus),
              location: parcel.currentStatus === 'DELIVERED' ? this.deliveryLocation : this.currentLocation
            });
          }
        }

        await this.updateMap();
        this.refreshMap(); // Force map refresh
      } else {
        this.error = 'Parcel not found';
        this.found = false;
      }
    } catch (error: any) {
      console.error('Error tracking parcel:', error);
      this.error = error?.error?.message || 'Parcel not found. Please check the tracking number.';
      this.found = false;
    } finally {
      this.loading = false;
    }
  }

  private formatStatus(status: string): string {
    switch (status) {
      case 'PENDING': return 'Pending';
      case 'IN_TRANSIT': return 'In Transit';
      case 'DELIVERED': return 'Delivered';
      case 'CANCELLED': return 'Cancelled';
      default: return status;
    }
  }

  async updateMap() {
    console.log('Updating map with coordinates:', {
      pickup: this.pickupCoordinates,
      delivery: this.deliveryCoordinates,
      current: this.currentCoordinates
    });
    
    this.mapLayers = [];
    
    if (this.pickupCoordinates && this.deliveryCoordinates) {
      // Create custom icons
      const pickupIcon = icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      const deliveryIcon = icon({
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });

      // Add pickup marker
      const pickupMarker = marker([this.pickupCoordinates.lat, this.pickupCoordinates.lng], {
        icon: pickupIcon
      }).bindPopup(`<strong>Pickup Location</strong><br>${this.pickupLocation}`);

      // Add delivery marker
      const deliveryMarker = marker([this.deliveryCoordinates.lat, this.deliveryCoordinates.lng], {
        icon: deliveryIcon
      }).bindPopup(`<strong>Delivery Location</strong><br>${this.deliveryLocation}`);

      this.mapLayers.push(pickupMarker, deliveryMarker);

      // Add current location marker for in-transit parcels
      if (this.currentCoordinates && this.status === 'In Transit') {
        console.log('Adding current location marker:', this.currentCoordinates);
        
        const currentIcon = icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const currentMarker = marker([this.currentCoordinates.lat, this.currentCoordinates.lng], {
          icon: currentIcon
        }).bindPopup(`<strong>Current Location</strong><br>${this.currentLocation}`);

        this.mapLayers.push(currentMarker);
      }

      // Add route line
      const routePoints: [number, number][] = [
        [this.pickupCoordinates.lat, this.pickupCoordinates.lng]
      ];

      if (this.currentCoordinates && this.status === 'In Transit') {
        routePoints.push([this.currentCoordinates.lat, this.currentCoordinates.lng]);
      }

      routePoints.push([this.deliveryCoordinates.lat, this.deliveryCoordinates.lng]);

      const routeLine = polyline(routePoints, {
        color: '#3388ff',
        weight: 4,
        opacity: 0.7,
        dashArray: this.status === 'Delivered' ? undefined : '10, 10'
      });

      this.mapLayers.push(routeLine);

      // Fit map to show all markers
      const bounds = new LatLngBounds([]);
      bounds.extend([this.pickupCoordinates.lat, this.pickupCoordinates.lng]);
      bounds.extend([this.deliveryCoordinates.lat, this.deliveryCoordinates.lng]);
      if (this.currentCoordinates) {
        bounds.extend([this.currentCoordinates.lat, this.currentCoordinates.lng]);
      }

      // Update map options to fit bounds
      this.mapOptions = {
        ...this.mapOptions,
        center: bounds.getCenter(),
        zoom: 8
      };
    }
  }

  clearTracking() {
    this.stopLocationUpdates(); // Stop location updates
    this.trackingNumber = '';
    this.found = false;
    this.status = '';
    this.history = [];
    this.pickupCoordinates = null;
    this.deliveryCoordinates = null;
    this.currentCoordinates = null;
    this.mapLayers = [];
    this.parcelDetails = null;
    this.error = null;
  }

  // Force map refresh after a short delay to ensure DOM is ready
  private refreshMap() {
    setTimeout(() => {
      console.log('Refreshing map...');
      this.updateMap();
    }, 100);
  }
} 
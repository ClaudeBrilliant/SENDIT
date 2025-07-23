
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../../../shared/components/nav/nav.component';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../../environments/environment';

declare var google: any;

interface TrackingEvent {
  date: string;
  status: string;
  location?: string;
  coordinates?: { lat: number, lng: number };
}

interface RouteInfo {
  distance: string;
  duration: string;
}

@Component({
  selector: 'app-track-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent],
  templateUrl: './track-parcel.component.html',
  styleUrls: ['./track-parcel.component.css']
})
export class TrackParcelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

  trackingNumber = '';
  found = false;
  status = '';
  loading = false;
  history: TrackingEvent[] = [];
  pickupCoordinates: { lat: number, lng: number } | null = null;
  deliveryCoordinates: { lat: number, lng: number } | null = null;
  currentLocation = '';
  estimatedDelivery = '';
  routeInfo: RouteInfo | null = null;

  private map: any;
  private directionsService: any;
  private directionsRenderer: any;
  private markers: any[] = [];

  constructor() {
    this.loadGoogleMapsScript();
  }

  ngAfterViewInit() {
    // Map will be initialized after Google Maps script loads
  }

  ngOnDestroy() {
    // Clean up markers and map instances
    this.clearMarkers();
  }

  private loadGoogleMapsScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof google !== 'undefined' && google.maps) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject();
      document.head.appendChild(script);
    });
  }

  async track() {
    this.loading = true;
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock tracking logic with multiple tracking numbers for demo
    if (this.trackingNumber === 'SEND123456') {
      this.found = true;
      this.status = 'In Transit';
      this.currentLocation = 'Nakuru Distribution Center';
      this.estimatedDelivery = 'January 24, 2024 - 2:00 PM';
      
      this.history = [
        { 
          date: '2024-01-20 09:00 AM', 
          status: 'Order Created', 
          location: 'Nairobi Warehouse',
          coordinates: { lat: -1.286389, lng: 36.817223 }
        },
        { 
          date: '2024-01-20 11:30 AM', 
          status: 'Package Picked Up', 
          location: 'Nairobi Sorting Facility',
          coordinates: { lat: -1.286389, lng: 36.817223 }
        },
        { 
          date: '2024-01-21 08:00 AM', 
          status: 'In Transit', 
          location: 'Nakuru Distribution Center',
          coordinates: { lat: -0.3031, lng: 36.0800 }
        }
      ];
      
      this.pickupCoordinates = { lat: -1.286389, lng: 36.817223 }; // Nairobi
      this.deliveryCoordinates = { lat: -0.091702, lng: 34.767956 }; // Kisumu
      
    } else if (this.trackingNumber === 'SEND789012') {
      this.found = true;
      this.status = 'Delivered';
      this.currentLocation = 'Delivered to recipient';
      this.estimatedDelivery = 'Delivered on January 23, 2024';
      
      this.history = [
        { 
          date: '2024-01-21 10:00 AM', 
          status: 'Order Created', 
          location: 'Mombasa Warehouse',
          coordinates: { lat: -4.0435, lng: 39.6682 }
        },
        { 
          date: '2024-01-22 02:00 PM', 
          status: 'In Transit', 
          location: 'Nairobi Hub',
          coordinates: { lat: -1.286389, lng: 36.817223 }
        },
        { 
          date: '2024-01-23 11:00 AM', 
          status: 'Out for Delivery', 
          location: 'Thika Distribution Center',
          coordinates: { lat: -1.0332, lng: 37.0690 }
        },
        { 
          date: '2024-01-23 03:30 PM', 
          status: 'Delivered', 
          location: 'Thika - Customer Address',
          coordinates: { lat: -1.0332, lng: 37.0690 }
        }
      ];
      
      this.pickupCoordinates = { lat: -4.0435, lng: 39.6682 }; // Mombasa
      this.deliveryCoordinates = { lat: -1.0332, lng: 37.0690 }; // Thika
      
    } else {
      this.found = false;
      this.status = '';
      this.history = [];
      this.pickupCoordinates = null;
      this.deliveryCoordinates = null;
      this.currentLocation = '';
      this.estimatedDelivery = '';
      this.routeInfo = null;
    }

    this.loading = false;

    // Initialize map after data is loaded
    if (this.found && this.pickupCoordinates && this.deliveryCoordinates) {
      setTimeout(() => {
        this.initializeMap();
      }, 100);
    }
  }

  private async initializeMap() {
    try {
      await this.loadGoogleMapsScript();
      
      if (!this.mapContainer || !this.pickupCoordinates || !this.deliveryCoordinates) {
        return;
      }

      // Initialize map
      this.map = new google.maps.Map(this.mapContainer.nativeElement, {
        zoom: 7,
        center: this.pickupCoordinates,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: 'poi',
            stylers: [{ visibility: 'off' }]
          }
        ]
      });

      // Initialize directions service and renderer
      this.directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
          strokeColor: '#4285f4',
          strokeWeight: 4,
          strokeOpacity: 0.8
        }
      });
      this.directionsRenderer.setMap(this.map);

      // Add custom markers for tracking history
      this.addTrackingMarkers();

      // Calculate and display route
      this.calculateRoute();

    } catch (error) {
      console.error('Error initializing Google Maps:', error);
    }
  }

  private addTrackingMarkers() {
    this.clearMarkers();

    this.history.forEach((event, index) => {
      if (event.coordinates) {
        const marker = new google.maps.Marker({
          position: event.coordinates,
          map: this.map,
          title: `${event.status} - ${event.location}`,
          icon: this.getMarkerIcon(event.status, index === this.history.length - 1),
          animation: index === this.history.length - 1 ? google.maps.Animation.BOUNCE : null
        });

        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h4 style="margin: 0 0 8px 0; color: #333;">${event.status}</h4>
              <p style="margin: 0 0 4px 0; font-size: 12px; color: #666;">${event.date}</p>
              <p style="margin: 0; font-size: 12px; color: #666;">${event.location}</p>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(this.map, marker);
        });

        this.markers.push(marker);
      }
    });
  }

  private getMarkerIcon(status: string, isLatest: boolean) {
    const baseUrl = 'https://maps.google.com/mapfiles/ms/icons/';
    
    if (isLatest) {
      return `${baseUrl}green-dot.png`; // Current location
    }
    
    switch (status.toLowerCase()) {
      case 'order created':
      case 'created':
        return `${baseUrl}blue-dot.png`;
      case 'picked up':
      case 'package picked up':
        return `${baseUrl}yellow-dot.png`;
      case 'in transit':
        return `${baseUrl}orange-dot.png`;
      case 'out for delivery':
        return `${baseUrl}purple-dot.png`;
      case 'delivered':
        return `${baseUrl}green-dot.png`;
      default:
        return `${baseUrl}red-dot.png`;
    }
  }

  private calculateRoute() {
    if (!this.directionsService || !this.pickupCoordinates || !this.deliveryCoordinates) {
      return;
    }

    const request = {
      origin: this.pickupCoordinates,
      destination: this.deliveryCoordinates,
      travelMode: google.maps.TravelMode.DRIVING,
      unitSystem: google.maps.UnitSystem.METRIC,
      avoidHighways: false,
      avoidTolls: false
    };

    this.directionsService.route(request, (result: any, status: any) => {
      if (status === google.maps.DirectionsStatus.OK) {
        this.directionsRenderer.setDirections(result);
        
        // Extract route information
        const route = result.routes[0];
        const leg = route.legs[0];
        
        this.routeInfo = {
          distance: leg.distance.text,
          duration: leg.duration.text
        };
        
        // Fit map to show entire route
        this.map.fitBounds(route.bounds);
        
      } else {
        console.error('Directions request failed due to ' + status);
      }
    });
  }

  private clearMarkers() {
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = [];
  }
}
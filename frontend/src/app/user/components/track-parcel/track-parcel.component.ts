
import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NavComponent } from '../../../shared/components/nav/nav.component';
import { FooterComponent } from '../../../shared/components/footer/footer.component';
import { latLng, tileLayer, marker, icon, MapOptions, Layer, polyline, LatLngBounds } from 'leaflet';
import { LeafletModule } from '@asymmetrik/ngx-leaflet';
import { CommonModule } from '@angular/common';

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
  selector: 'app-track-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, FooterComponent, LeafletModule, HttpClientModule],
  templateUrl: './track-parcel.component.html',
  styleUrls: ['./track-parcel.component.css']
})
export class TrackParcelComponent implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef;

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

  constructor(private http: HttpClient) {}

  // Geocode a place name to coordinates using OpenStreetMap Nominatim
  async geocodePlace(placeName: string): Promise<{ lat: number, lng: number } | null> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}&limit=1`;
      const response = await this.http.get<NominatimResponse[]>(url).toPromise();
      
      if (response && response.length > 0) {
        return {
          lat: parseFloat(response[0].lat),
          lng: parseFloat(response[0].lon)
        };
      }
      return null;
    } catch (error) {
      console.error('Geocoding error:', error);
      return null;
    }
  }

  // Reverse geocode coordinates to place name
  async reverseGeocode(lat: number, lng: number): Promise<string> {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
      const response = await this.http.get<NominatimResponse>(url).toPromise();
      
      if (response) {
        return response.display_name;
      }
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
  }

  async track() {
    this.loading = true;
    
    try {
      // Mock tracking logic with real places
      if (this.trackingNumber === 'SEND123456') {
        this.found = true;
        this.status = 'In Transit';
        
        // Real place names for Kenya
        this.pickupLocation = 'KICC, Nairobi, Kenya';
        this.deliveryLocation = 'Fort Jesus, Mombasa, Kenya';
        this.currentLocation = 'Nakuru Town, Kenya';
        
        // Geocode the places to get coordinates
        this.pickupCoordinates = await this.geocodePlace(this.pickupLocation);
        this.deliveryCoordinates = await this.geocodePlace(this.deliveryLocation);
        this.currentCoordinates = await this.geocodePlace(this.currentLocation);

        this.history = [
          { date: '2024-01-20', status: 'Created', location: this.pickupLocation },
          { date: '2024-01-21', status: 'Picked Up', location: this.pickupLocation },
          { date: '2024-01-22', status: 'In Transit', location: this.currentLocation },
          { date: '2024-01-23', status: 'Out for Delivery', location: 'Near ' + this.deliveryLocation }
        ];

        await this.updateMap();
        
      } else if (this.trackingNumber === 'SEND789012') {
        // Another example with different locations
        this.found = true;
        this.status = 'Delivered';
        
        this.pickupLocation = 'University of Nairobi, Kenya';
        this.deliveryLocation = 'Kenyatta University, Kenya';
        this.currentLocation = this.deliveryLocation;
        
        this.pickupCoordinates = await this.geocodePlace(this.pickupLocation);
        this.deliveryCoordinates = await this.geocodePlace(this.deliveryLocation);
        this.currentCoordinates = this.deliveryCoordinates;

        this.history = [
          { date: '2024-01-18', status: 'Created', location: this.pickupLocation },
          { date: '2024-01-19', status: 'Picked Up', location: this.pickupLocation },
          { date: '2024-01-19', status: 'Out for Delivery', location: 'En route to ' + this.deliveryLocation },
          { date: '2024-01-20', status: 'Delivered', location: this.deliveryLocation }
        ];

        await this.updateMap();
        
      } else {
        this.found = false;
        this.status = '';
        this.history = [];
        this.pickupCoordinates = null;
        this.deliveryCoordinates = null;
        this.currentCoordinates = null;
        this.mapLayers = [];
      }
    } catch (error) {
      console.error('Error tracking parcel:', error);
    } finally {
      this.loading = false;
    }
  }

  async updateMap() {
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

      // Add current location marker if different from pickup/delivery
      if (this.currentCoordinates && 
          this.status === 'In Transit' &&
          (this.currentCoordinates.lat !== this.pickupCoordinates.lat || 
           this.currentCoordinates.lng !== this.pickupCoordinates.lng) &&
          (this.currentCoordinates.lat !== this.deliveryCoordinates.lat || 
           this.currentCoordinates.lng !== this.deliveryCoordinates.lng)) {
        
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

  // Helper method to search for places (you can use this for autocomplete)
  async searchPlaces(query: string): Promise<NominatimResponse[]> {
    try {
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ke`;
      const response = await this.http.get<NominatimResponse[]>(url).toPromise();
      return response || [];
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  ngAfterViewInit(): void {
    throw new Error('Method not implemented.');
  }
  ngOnDestroy(): void {
    throw new Error('Method not implemented.');
  }
}
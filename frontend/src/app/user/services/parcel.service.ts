import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface Parcel {
  id: string;
  trackingNumber: string;
  sender: string;
  receiver: string;
  pickupLocation: string;
  deliveryLocation: string;
  currentStatus: string;
  weight: number;
  price: number;
  createdAt: string;
  updatedAt: string;
  estimatedDelivery?: string;
  courierId?: string;
}

export interface TrackingHistory {
  id: string;
  parcelId: string;
  status: string;
  location: string;
  timestamp: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class ParcelService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  trackParcel(trackingNumber: string): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.api}/parcels/track/${trackingNumber}`);
  }

  getParcelById(parcelId: string): Observable<Parcel> {
    return this.http.get<Parcel>(`${this.api}/parcels/${parcelId}`);
  }

  getTrackingHistory(parcelId: string): Observable<TrackingHistory[]> {
    return this.http.get<TrackingHistory[]>(`${this.api}/parcels/${parcelId}/history`);
  }

  // Get user's sent parcels
  getUserSentParcels(): Observable<Parcel[]> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    return this.http.get<Parcel[]>(`${this.api}/parcels/user/sent?userId=${userId}`);
  }

  // Get user's received parcels
  getUserReceivedParcels(): Observable<Parcel[]> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    return this.http.get<Parcel[]>(`${this.api}/parcels/user/received?userId=${userId}`);
  }

  // Get all user's parcels (sent + received)
  getUserParcels(): Observable<Parcel[]> {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    return this.http.get<Parcel[]>(`${this.api}/parcels/user/all?userId=${userId}`);
  }

  // Get the latest courier location
  getCourierLocation(courierId: string) {
    return this.http.get<{ id: string, latitude: number, longitude: number, address: string, timestamp: string }>(`${this.api}/courier/location/${courierId}`);
  }
}

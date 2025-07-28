import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private api = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardStats() {
    return this.http.get(`${this.api}/admin/stats`);
  }

  getRecentParcels() {
    return this.http.get(`${this.api}/admin/parcels/recent`);
  }

  getRecentUsers() {
    return this.http.get(`${this.api}/admin/users/recent`);
  }

  getAllParcels() {
    return this.http.get(`${this.api}/admin/parcels`);
  }

  createParcel(parcelData: any) {
    return this.http.post(`${this.api}/admin/parcels`, parcelData);
  }

  getAllUsers() {
    return this.http.get(`${this.api}/admin/users`);
  }

  getAnalytics() {
    return this.http.get(`${this.api}/admin/analytics`);
  }

  getSettings() {
    return this.http.get(`${this.api}/admin/settings`);
  }

  updateSettings(settings: any) {
    return this.http.put(`${this.api}/admin/settings`, settings);
  }

  trackParcel(trackingNumber: string) {
    return this.http.get(`${this.api}/parcels/${trackingNumber}`);
  }

  getLogs() {
    return this.http.get(`${this.api}/admin/logs`);
  }

  updateUser(userId: string, userData: any) {
    return this.http.patch(`${this.api}/admin/users/${userId}`, userData);
  }

  deleteUser(userId: string) {
    return this.http.delete(`${this.api}/admin/users/${userId}`);
  }

  deleteParcel(parcelId: string) {
    return this.http.delete(`${this.api}/admin/parcels/${parcelId}`);
  }

  updateParcel(parcelId: string, parcelData: any) {
    return this.http.patch(`${this.api}/admin/parcels/${parcelId}`, parcelData);
  }

  createSampleLogs() {
    return this.http.post(`${this.api}/admin/logs/sample`, {});
  }

  getAvailableCouriers() {
    return this.http.get(`${this.api}/admin/couriers`);
  }

  assignCourierToParcel(parcelId: string, courierId: string) {
    return this.http.patch(`${this.api}/admin/parcels/${parcelId}/assign-courier`, { courierId });
  }

  // Get all parcel IDs for testing tracking
  getAllParcelIds() {
    return this.http.get<any[]>(`${this.api}/admin/parcels`).pipe(
      map(parcels => parcels.map(parcel => ({ id: parcel.id, trackingNumber: parcel.id })))
    );
  }

  // Get courier location for a parcel
  getCourierLocation(parcelId: string) {
    return this.http.get<any>(`${this.api}/admin/parcels/${parcelId}/courier-location`);
  }

  // Get parcel tracking history
  getParcelTrackingHistory(parcelId: string) {
    return this.http.get<any[]>(`${this.api}/admin/parcels/${parcelId}/tracking-history`);
  }
}

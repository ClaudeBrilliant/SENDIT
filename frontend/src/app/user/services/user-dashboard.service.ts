import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UserDashboardService {
  private api = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getUserInfo(userId: string) {
    return this.http.get(`${this.api}/users/${userId}`);
  }

  getSentParcels(userId: string) {
    return this.http.get(`${this.api}/parcels/sent?userId=${userId}`);
  }

  getReceivedParcels(userId: string) {
    return this.http.get(`${this.api}/parcels/received?userId=${userId}`);
  }
} 
import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-courier-dashboard',
  standalone: true,
  imports: [CommonModule],
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
} 
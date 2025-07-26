import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { ParcelsComponent } from '../parcels/parcels.component';
import { AnalyticsComponent } from '../analytics/analytics.component';
import { SettingsComponent } from '../settings/settings.component';
import { AdminTrackParcelComponent } from '../track-parcel/track-parcel.component';
import { LogsComponent } from '../logs/logs.component';

export interface ParcelStats {
  total: number;
  pending: number;
  inTransit: number;
  delivered: number;
  cancelled: number;
}

export interface RecentParcel {
  id: string;
  trackingNumber: string;
  senderName: string;
  receiverName: string;
  destination: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'cancelled';
  createdAt: Date;
  weight: number;
  amount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  parcelsCount: number;
  joinedAt: Date;
  status: 'active' | 'inactive';
  profileImage?: string;
  createdAt?: Date;
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ParcelsComponent,
    AnalyticsComponent,
    SettingsComponent,
    AdminTrackParcelComponent,
    LogsComponent
  ],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  stats: any = {};
  recentParcels: any[] = [];
  recentUsers: any[] = [];
  loading = true;

  selectedTab: string = 'overview';
  sidebarCollapsed: boolean = false;

  constructor(private router: Router, private adminService: AdminService) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.loading = true;
    this.adminService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats || {};
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching dashboard stats:', error);
        this.stats = {};
        this.loading = false;
      }
    });
    
    this.adminService.getRecentParcels().subscribe({
      next: (parcels) => {
        this.recentParcels = Array.isArray(parcels) ? parcels : [];
      },
      error: (error) => {
        console.error('Error fetching recent parcels:', error);
        this.recentParcels = [];
      }
    });
    
    this.adminService.getRecentUsers().subscribe({
      next: (users) => {
        this.recentUsers = Array.isArray(users) ? users : [];
      },
      error: (error) => {
        console.error('Error fetching recent users:', error);
        this.recentUsers = [];
      }
    });
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  onSearch(event: any): void {
    // Implement search logic if needed
    // this.searchQuery = event.target.value; // This line is removed
  }

  getPendingPercentage(): number {
    return this.stats.total ? Math.round((this.stats.pending / this.stats.total) * 100) : 0;
  }

  exportReport(): void {
    // Implement export logic
    console.log('Exporting report...');
  }

  refreshData(): void {
    // Implement refresh logic
    this.fetchDashboardData();
  }

  trackByParcelId(index: number, parcel: RecentParcel): string {
    return parcel.id;
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  getUserInitials(name: string): string {
    if (!name || typeof name !== 'string') return '';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  }

  formatStatus(status: string): string {
    if (!status) return '';
    return status.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  }

  viewParcelDetails(parcelId: string): void {
    this.router.navigate(['/admin/parcels', parcelId]);
  }

  updateParcelStatus(parcelId: string, newStatus: string): void {
    // Implement status update logic
    console.log(`Updating parcel ${parcelId} to status: ${newStatus}`);
  }

  viewUserDetails(userId: string): void {
    this.router.navigate(['/admin/users', userId]);
  }

  createNewParcel(): void {
    this.router.navigate(['/admin/create-order']);
  }

  createOrder(): void {
    this.router.navigate(['/admin/create-order']);
  }

  manageOrders(): void {
    this.router.navigate(['/admin/manage-orders']);
  }

  manageUsers(): void {
    this.router.navigate(['/admin/user-management']);
  }

  exportData(): void {
    // Implement export functionality
    console.log('Exporting data...');
  }

  logout(): void {
    // Implement logout logic
    console.log('Logging out...');
    this.router.navigate(['/login']);
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsComponent } from "../analytics/analytics.component";
import { AdminTrackParcelComponent } from '../track-parcel/track-parcel.component';
import { LogsComponent } from '../logs/logs.component';
import { SettingsComponent } from '../settings/settings.component';
import { ParcelsComponent } from '../parcels/parcels.component';

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
  imports: [CommonModule, FormsModule, AnalyticsComponent, AdminTrackParcelComponent, LogsComponent, SettingsComponent, ParcelsComponent],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {
  // Dashboard data
  parcelStats: ParcelStats = {
    total: 1247,
    pending: 89,
    inTransit: 156,
    delivered: 987,
    cancelled: 15
  };

  recentParcels: RecentParcel[] = [
    {
      id: '1',
      trackingNumber: 'SND001234',
      senderName: 'John Doe',
      receiverName: 'Jane Smith',
      destination: 'Nairobi, Kenya',
      status: 'in-transit',
      createdAt: new Date('2024-01-15'),
      weight: 2.5,
      amount: 1200
    },
    {
      id: '2',
      trackingNumber: 'SND001235',
      senderName: 'Alice Johnson',
      receiverName: 'Bob Wilson',
      destination: 'Mombasa, Kenya',
      status: 'pending',
      createdAt: new Date('2024-01-16'),
      weight: 1.2,
      amount: 800
    },
    {
      id: '3',
      trackingNumber: 'SND001236',
      senderName: 'Carol Brown',
      receiverName: 'David Lee',
      destination: 'Kisumu, Kenya',
      status: 'delivered',
      createdAt: new Date('2024-01-14'),
      weight: 3.8,
      amount: 1500
    }
  ];

  recentUsers: User[] = [
    {
      id: '1',
      name: 'Michael Johnson',
      email: 'michael@example.com',
      phone: '+254712345678',
      parcelsCount: 12,
      joinedAt: new Date('2024-01-10'),
      status: 'active',
      profileImage: '',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+254723456789',
      parcelsCount: 8,
      joinedAt: new Date('2024-01-12'),
      status: 'active',
      profileImage: '',
      createdAt: new Date('2024-01-12')
    },
    {
      id: '3',
      name: 'Robert Davis',
      email: 'robert@example.com',
      phone: '+254734567890',
      parcelsCount: 5,
      joinedAt: new Date('2024-01-11'),
      status: 'inactive',
      profileImage: '',
      createdAt: new Date('2024-01-11')
    }
  ];

  // UI State
  selectedTab: string = 'overview';
  sidebarCollapsed: boolean = false;
  notifications: number = 5;
  searchQuery: string = '';
  hasNotifications: boolean = true;
  userProfileImage: string = '/assets/default-avatar.png';
  currentUser: User = { id: '1', name: 'Admin User', email: 'admin@example.com', phone: '', parcelsCount: 0, joinedAt: new Date(), status: 'active', profileImage: '/assets/default-avatar.png', createdAt: new Date() };

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // Simulate API call to load dashboard data
    console.log('Loading dashboard data...');
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  selectTab(tab: string): void {
    this.selectedTab = tab;
  }

  onSearch(event: any): void {
    // Implement search logic if needed
    this.searchQuery = event.target.value;
  }

  getPendingPercentage(): number {
    return this.parcelStats.total ? Math.round((this.parcelStats.pending / this.parcelStats.total) * 100) : 0;
  }

  exportReport(): void {
    // Implement export logic
    console.log('Exporting report...');
  }

  refreshData(): void {
    // Implement refresh logic
    this.loadDashboardData();
  }

  trackByParcelId(index: number, parcel: RecentParcel): string {
    return parcel.id;
  }

  trackByUserId(index: number, user: User): string {
    return user.id;
  }

  getUserInitials(name: string): string {
    if (!name) return '';
    const parts = name.split(' ');
    return parts.map(p => p[0]).join('').toUpperCase();
  }

  formatStatus(status: string): string {
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
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from "../profile/profile.component";
import { TrackParcelComponent } from "./../track-parcel/track-parcel.component";

// Interfaces
export interface Parcel {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderEmail: string;
  receiverName: string;
  receiverEmail: string;
  pickupAddress: string;
  deliveryAddress: string;
  weight: number;
  weightCategory: 'LIGHT' | 'MEDIUM' | 'HEAVY';
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  estimatedDelivery: Date;
  createdAt: Date;
  updatedAt: Date;
  price: number;
  pickupCoordinates?: { lat: number; lng: number };
  deliveryCoordinates?: { lat: number; lng: number };
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatar?: string;
}

export interface DashboardState {
  user: User | null;
  sentParcels: Parcel[];
  receivedParcels: Parcel[];
  loading: boolean;
  error: string | null;
  totalSentParcels: number;
  totalReceivedParcels: number;
  currentPage: number;
  pageSize: number;
}

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ProfileComponent, TrackParcelComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Mock data for demonstration
  user: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phoneNumber: '+1234567890',
    avatar: '/assets/images/default-avatar.png'
  };

  // Mock parcels data
  sentParcels: Parcel[] = [
    {
      id: '1',
      trackingNumber: 'SEND123456',
      senderName: 'John Doe',
      senderEmail: 'john.doe@example.com',
      receiverName: 'Jane Smith',
      receiverEmail: 'jane.smith@example.com',
      pickupAddress: '123 Main St, City, State',
      deliveryAddress: '456 Oak Ave, City, State',
      weight: 2.5,
      weightCategory: 'MEDIUM',
      status: 'IN_TRANSIT',
      estimatedDelivery: new Date('2024-01-25'),
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-01-22'),
      price: 29.99
    },
    {
      id: '2',
      trackingNumber: 'SEND789012',
      senderName: 'John Doe',
      senderEmail: 'john.doe@example.com',
      receiverName: 'Bob Johnson',
      receiverEmail: 'bob.johnson@example.com',
      pickupAddress: '123 Main St, City, State',
      deliveryAddress: '789 Pine St, City, State',
      weight: 1.2,
      weightCategory: 'LIGHT',
      status: 'DELIVERED',
      estimatedDelivery: new Date('2024-01-18'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-18'),
      price: 19.99
    }
  ];

  receivedParcels: Parcel[] = [
    {
      id: '3',
      trackingNumber: 'RECV345678',
      senderName: 'Alice Brown',
      senderEmail: 'alice.brown@example.com',
      receiverName: 'John Doe',
      receiverEmail: 'john.doe@example.com',
      pickupAddress: '321 Elm St, City, State',
      deliveryAddress: '123 Main St, City, State',
      weight: 3.0,
      weightCategory: 'HEAVY',
      status: 'PENDING',
      estimatedDelivery: new Date('2024-01-28'),
      createdAt: new Date('2024-01-23'),
      updatedAt: new Date('2024-01-23'),
      price: 39.99
    }
  ];
  
  // Component state
  activeTab: 'sent' | 'received' = 'sent';
  searchForm!: FormGroup;
  selectedParcel: Parcel | null = null;
  showParcelDetails = false;
  loading = false;
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  
  // Filter options
  statusFilters = [
    { value: '', label: 'All Statuses' },
    { value: 'PENDING', label: 'Pending' },
    { value: 'PICKED_UP', label: 'Picked Up' },
    { value: 'IN_TRANSIT', label: 'In Transit' },
    { value: 'DELIVERED', label: 'Delivered' },
    { value: 'CANCELLED', label: 'Cancelled' }
  ];
  
  weightFilters = [
    { value: '', label: 'All Weights' },
    { value: 'LIGHT', label: 'Light (0-2kg)' },
    { value: 'MEDIUM', label: 'Medium (2-5kg)' },
    { value: 'HEAVY', label: 'Heavy (5kg+)' }
  ];

  showProfileModal = false;
  showTrackParcelModal = false;

  openProfileModal(): void {
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  openTrackParcelModal(): void {
    this.showTrackParcelModal = true;
  }

  closeTrackParcelModal(): void {
    this.showTrackParcelModal = false;
  }

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.initializeSearchForm();
  }

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeSearchForm(): void {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      statusFilter: [''],
      weightFilter: [''],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  private loadDashboardData(): void {
    // Mock data loading
    this.loading = false;
  }

  // Tab Management
  switchTab(tab: 'sent' | 'received'): void {
    this.activeTab = tab;
    this.currentPage = 1;
    this.loadDashboardData();
  }

  // Search and Filter
  performSearch(): void {
    // Mock search functionality
    console.log('Search performed:', this.searchForm.value);
  }

  clearFilters(): void {
    this.searchForm.reset();
    this.currentPage = 1;
    this.loadDashboardData();
  }

  // Pagination
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadDashboardData();
  }

  onPageSizeChange(pageSize: string): void {
    this.pageSize = Number(pageSize);
    this.currentPage = 1;
    this.loadDashboardData();
  }

  // Parcel Actions
  viewParcelDetails(parcel: Parcel): void {
    this.selectedParcel = parcel;
    this.showParcelDetails = true;
  }

  closeParcelDetails(): void {
    this.selectedParcel = null;
    this.showParcelDetails = false;
  }

  trackParcel(trackingNumber?: string): void {
    if (trackingNumber) {
      // Optionally handle tracking number logic
    }
    this.openTrackParcelModal();
  }

  createNewParcel(): void {
    this.trackParcel();
  }

  editParcel(parcelId: string): void {
    this.router.navigate(['/edit-parcel', parcelId]);
  }

  cancelParcel(parcelId: string): void {
    if (confirm('Are you sure you want to cancel this parcel delivery?')) {
      console.log('Cancelling parcel:', parcelId);
    }
  }

  // Utility Methods
  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'PENDING': 'status-pending',
      'PICKED_UP': 'status-picked-up',
      'IN_TRANSIT': 'status-in-transit',
      'DELIVERED': 'status-delivered',
      'CANCELLED': 'status-cancelled'
    };
    return statusClasses[status] || 'status-default';
  }

  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'PENDING': 'clock',
      'PICKED_UP': 'package',
      'IN_TRANSIT': 'truck',
      'DELIVERED': 'check-circle',
      'CANCELLED': 'x-circle'
    };
    return statusIcons[status] || 'help-circle';
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  }

  getWeightCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'LIGHT': 'Light (0-2kg)',
      'MEDIUM': 'Medium (2-5kg)',
      'HEAVY': 'Heavy (5kg+)'
    };
    return labels[category] || category;
  }

  viewProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  goToProfile(): void {
    this.router.navigate(['/user/profile']);
  }

  logout(): void {
    this.router.navigate(['/auth/login']);
  }

  goHome(): void {
    this.router.navigate(['/home']);
  }

  getDashboardStats() {
    return {
      totalSentParcels: this.sentParcels.length,
      totalReceivedParcels: this.receivedParcels.length,
      pendingCount: this.sentParcels.filter(p => p.status === 'PENDING').length,
      deliveredCount: this.sentParcels.filter(p => p.status === 'DELIVERED').length
    };
  }

  getPendingCount(): number {
    return this.sentParcels.filter(p => p.status === 'PENDING').length;
  }

  getDeliveredCount(): number {
    return this.sentParcels.filter(p => p.status === 'DELIVERED').length;
  }

  exportParcels(): void {
    console.log('Exporting parcels...');
  }

  trackByParcelId(index: number, parcel: Parcel): string {
    return parcel.id;
  }
}
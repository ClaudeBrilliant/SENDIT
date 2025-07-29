import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileComponent } from "../profile/profile.component";
import { UserDashboardService } from '../../services/user-dashboard.service';
import { NotificationService } from '../../../shared/services/notification.service';

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
  phone: string;
  profileImage?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
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
  imports: [CommonModule, ReactiveFormsModule, ProfileComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  user: User | null = null;
  sentParcels: Parcel[] = [];
  receivedParcels: Parcel[] = [];
  
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

  openProfileModal(): void {
    this.showProfileModal = true;
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private dashboardService: UserDashboardService,
    private notificationService: NotificationService
  ) {
    this.initializeSearchForm();
  }

  ngOnInit(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('User from localStorage:', user);
    
    if (user && user.id) {
      this.loading = true;
      console.log('Loading data for user ID:', user.id);
      
      this.dashboardService.getUserInfo(user.id).subscribe({
        next: (userData: any) => {
          console.log('User data loaded:', userData);
          this.user = userData;
        },
        error: (error) => {
          console.error('Error loading user info:', error);
          // Fallback to localStorage data if API call fails
          this.user = {
            id: user.id,
            firstName: user.firstName || user.name?.split(' ')[0] || '',
            lastName: user.lastName || user.name?.split(' ').slice(1).join(' ') || '',
            email: user.email,
            phone: user.phone || '',
            profileImage: user.profileImage,
            role: user.role || 'USER',
            createdAt: user.createdAt || new Date().toISOString(),
            updatedAt: user.updatedAt || new Date().toISOString()
          };
        }
      });
      
      this.dashboardService.getSentParcels(user.id).subscribe({
        next: (parcels: any) => {
          console.log('Sent parcels loaded:', parcels);
          this.sentParcels = parcels;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading sent parcels:', error);
          this.loading = false;
        }
      });
      
      this.dashboardService.getReceivedParcels(user.id).subscribe({
        next: (parcels: any) => {
          console.log('Received parcels loaded:', parcels);
          this.receivedParcels = parcels;
        },
        error: (error) => {
          console.error('Error loading received parcels:', error);
        }
      });
    } else {
      console.error('No user found in localStorage or user ID is missing');
      console.log('localStorage user:', localStorage.getItem('user'));
    }
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
      // Navigate to track parcel page with the tracking number
      this.router.navigate(['/user/track-parcel'], { 
        queryParams: { tracking: trackingNumber } 
      });
    } else {
      // Navigate to track parcel page without tracking number
      this.router.navigate(['/user/track-parcel']);
    }
  }

  // Show available parcels for tracking
  showAvailableParcelsForTracking(): void {
    const allParcels = [...this.sentParcels, ...this.receivedParcels];
    if (allParcels.length > 0) {
      // Navigate to track parcel page with a list of available tracking numbers
      const trackingNumbers = allParcels.map(p => p.trackingNumber).join(',');
      this.router.navigate(['/user/track-parcel'], { 
        queryParams: { available: trackingNumbers } 
      });
    } else {
      // No parcels available, show a message and navigate to track parcel page
      this.notificationService.info(
        'No Parcels Available',
        'You don\'t have any parcels to track yet. You can enter a tracking number manually.'
      );
      this.router.navigate(['/user/track-parcel']);
    }
  }

  createNewParcel(): void {
    this.trackParcel();
  }

  editParcel(parcelId: string): void {
    this.router.navigate(['/edit-parcel', parcelId]);
  }

  cancelParcel(parcelId: string): void {
    this.notificationService.confirm(
      'Cancel Parcel Delivery',
      'Are you sure you want to cancel this parcel delivery?',
      'Cancel Delivery',
      'Keep Delivery',
      () => {
        console.log('Cancelling parcel:', parcelId);
        this.notificationService.success(
          'Parcel Cancelled',
          'The parcel delivery has been cancelled successfully.'
        );
      },
      () => {
        console.log('Parcel cancellation cancelled by user');
      }
    );
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

  // User Avatar Helper Methods
  getUserInitials(): string {
    if (!this.user) return '';
    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }

  getAvatarColor(): string {
    if (!this.user) return '#FB9F3E';
    const colors = ['#FB9F3E', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const index = this.user.id.charCodeAt(0) % colors.length;
    return colors[index];
  }

  hasProfileImage(): boolean {
    return !!(this.user?.profileImage);
  }
}
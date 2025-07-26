import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { UpdateStatusComponent } from '../update-status/update-status.component';

export interface Order {
  id: string;
  trackingNumber: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  receiverName: string;
  receiverEmail: string;
  receiverPhone: string;
  pickupAddress: string;
  deliveryAddress: string;
  packageDescription: string;
  weight: number;
  weightCategory: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  deliveryType: string;
  status: 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'cancelled';
  paymentMethod: string;
  totalPrice: number;
  insurance: boolean;
  pickupDate: Date;
  estimatedDelivery: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-manage-orders',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UpdateStatusComponent],
  templateUrl: './manage-orders.component.html',
  styleUrls: ['./manage-orders.component.css']
})
export class ManageOrdersComponent implements OnInit {
  orders: Order[] = [];
  filteredOrders: Order[] = [];
  selectedOrder: Order | null = null;
  isLoading = false;
  error: string | null = null;
  searchForm: FormGroup;
  
  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;
  
  // Status options for filtering
  statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'picked-up', label: 'Picked Up' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'out-for-delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Mock data
  mockOrders: Order[] = [
    {
      id: '1',
      trackingNumber: 'SEND0012345678',
      senderName: 'John Doe',
      senderEmail: 'john@example.com',
      senderPhone: '+254712345678',
      receiverName: 'Jane Smith',
      receiverEmail: 'jane@example.com',
      receiverPhone: '+254723456789',
      pickupAddress: '123 Main St, Nairobi, Kenya',
      deliveryAddress: '456 Oak Ave, Mombasa, Kenya',
      packageDescription: 'Electronics package',
      weight: 2.5,
      weightCategory: 'medium',
      dimensions: { length: 30, width: 20, height: 15 },
      deliveryType: 'express',
      status: 'in-transit',
      paymentMethod: 'cash_on_delivery',
      totalPrice: 1200,
      insurance: true,
      pickupDate: new Date('2024-01-15'),
      estimatedDelivery: new Date('2024-01-17'),
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: '2',
      trackingNumber: 'SEND0012345679',
      senderName: 'Alice Johnson',
      senderEmail: 'alice@example.com',
      senderPhone: '+254734567890',
      receiverName: 'Bob Wilson',
      receiverEmail: 'bob@example.com',
      receiverPhone: '+254745678901',
      pickupAddress: '789 Pine Rd, Kisumu, Kenya',
      deliveryAddress: '321 Elm St, Nakuru, Kenya',
      packageDescription: 'Documents and books',
      weight: 1.2,
      weightCategory: 'light',
      dimensions: { length: 25, width: 15, height: 10 },
      deliveryType: 'standard',
      status: 'pending',
      paymentMethod: 'bank_transfer',
      totalPrice: 800,
      insurance: false,
      pickupDate: new Date('2024-01-18'),
      estimatedDelivery: new Date('2024-01-22'),
      createdAt: new Date('2024-01-16'),
      updatedAt: new Date('2024-01-16')
    },
    {
      id: '3',
      trackingNumber: 'SEND0012345680',
      senderName: 'Carol Brown',
      senderEmail: 'carol@example.com',
      senderPhone: '+254756789012',
      receiverName: 'David Lee',
      receiverEmail: 'david@example.com',
      receiverPhone: '+254767890123',
      pickupAddress: '654 Maple Dr, Eldoret, Kenya',
      deliveryAddress: '987 Cedar Ln, Thika, Kenya',
      packageDescription: 'Clothing and accessories',
      weight: 3.8,
      weightCategory: 'heavy',
      dimensions: { length: 40, width: 30, height: 20 },
      deliveryType: 'same_day',
      status: 'delivered',
      paymentMethod: 'mobile_money',
      totalPrice: 2500,
      insurance: true,
      pickupDate: new Date('2024-01-14'),
      estimatedDelivery: new Date('2024-01-14'),
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14')
    }
  ];

  showUpdateStatusModal = false;
  orderToUpdate: Order | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private adminService: AdminService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      statusFilter: ['all'],
      dateFrom: [''],
      dateTo: ['']
    });
  }

  ngOnInit(): void {
    this.loadOrders();
    this.setupSearchListener();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    
    this.adminService.getAllParcels().subscribe({
      next: (data: any) => {
        console.log('Orders data received:', data); // Debug log
        
        // Transform the API response to match our Order interface
        this.orders = (data || []).map((parcel: any) => ({
          id: parcel.id,
          trackingNumber: parcel.trackingNumber || parcel.id,
          senderName: parcel.sender || 'Unknown Sender',
          senderEmail: parcel.senderEmail || '',
          senderPhone: parcel.senderPhone || '',
          receiverName: parcel.receiver || 'Unknown Receiver',
          receiverEmail: parcel.receiverEmail || '',
          receiverPhone: parcel.receiverPhone || '',
          pickupAddress: parcel.pickupLocation || 'Unknown Location',
          deliveryAddress: parcel.deliveryLocation || 'Unknown Location',
          packageDescription: 'Package', // Default description
          weight: parcel.weight || 0,
          weightCategory: this.getWeightCategory(parcel.weight || 0),
          dimensions: { length: 30, width: 20, height: 15 }, // Default dimensions
          deliveryType: 'standard', // Default delivery type
          status: this.mapStatus(parcel.status),
          paymentMethod: 'cash_on_delivery', // Default payment method
          totalPrice: parcel.price || 0,
          insurance: false, // Default insurance
          pickupDate: new Date(parcel.createdAt),
          estimatedDelivery: new Date(parcel.createdAt), // Default to creation date
          createdAt: new Date(parcel.createdAt),
          updatedAt: new Date(parcel.updatedAt || parcel.createdAt)
        }));
        
        console.log('Transformed orders:', this.orders); // Debug log
        this.filteredOrders = [...this.orders];
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        this.error = 'Failed to load orders. Please try again.';
        this.orders = [];
        this.filteredOrders = [];
        this.calculatePagination();
        this.isLoading = false;
      }
    });
  }

  setupSearchListener(): void {
    this.searchForm.valueChanges.subscribe(() => {
      this.filterOrders();
    });
  }

  filterOrders(): void {
    const { searchTerm, statusFilter, dateFrom, dateTo } = this.searchForm.value;
    
    this.filteredOrders = this.orders.filter(order => {
      // Search term filter
      const searchMatch = !searchTerm || 
        order.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.senderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.receiverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.packageDescription.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const statusMatch = statusFilter === 'all' || order.status === statusFilter;
      
      // Date range filter
      let dateMatch = true;
      if (dateFrom || dateTo) {
        const orderDate = new Date(order.createdAt);
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          dateMatch = dateMatch && orderDate >= fromDate;
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          toDate.setHours(23, 59, 59, 999); // End of day
          dateMatch = dateMatch && orderDate <= toDate;
        }
      }
      
      return searchMatch && statusMatch && dateMatch;
    });
    
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.itemsPerPage);
  }

  getPaginatedOrders(): Order[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredOrders.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = itemsPerPage;
    this.currentPage = 1;
    this.calculatePagination();
  }

  viewOrderDetails(order: Order): void {
    this.selectedOrder = order;
  }

  closeOrderDetails(): void {
    this.selectedOrder = null;
  }

  updateOrderStatus(orderId: string, newStatus: string): void {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
      // Optimistically update UI
      order.status = newStatus as any;
      order.updatedAt = new Date();
      
      // Update filtered orders
      const filteredOrder = this.filteredOrders.find(o => o.id === orderId);
      if (filteredOrder) {
        filteredOrder.status = newStatus as any;
        filteredOrder.updatedAt = new Date();
      }
      
      // Map frontend status to backend status
      const backendStatusMap: { [key: string]: string } = {
        'pending': 'PENDING',
        'picked-up': 'PENDING', // Backend doesn't have picked-up, use PENDING
        'in-transit': 'IN_TRANSIT',
        'out-for-delivery': 'IN_TRANSIT', // Backend doesn't have out-for-delivery, use IN_TRANSIT
        'delivered': 'DELIVERED',
        'cancelled': 'CANCELLED'
      };
      
      const backendStatus = backendStatusMap[newStatus] || 'PENDING';
      
      // Make API call to update status
      this.adminService.updateParcel(orderId, { currentStatus: backendStatus }).subscribe({
        next: (response: any) => {
          console.log(`Successfully updated order ${orderId} status to ${newStatus}`);
        },
        error: (error: any) => {
          console.error('Error updating order status:', error);
          // Revert the optimistic update on error
          order.status = order.status; // Keep current status
          if (filteredOrder) {
            filteredOrder.status = order.status;
          }
          alert('Failed to update order status. Please try again.');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'picked-up': 'status-picked-up',
      'in-transit': 'status-in-transit',
      'out-for-delivery': 'status-out-for-delivery',
      'delivered': 'status-delivered',
      'cancelled': 'status-cancelled'
    };
    return statusClasses[status] || 'status-pending';
  }

  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'pending': 'clock',
      'picked-up': 'package',
      'in-transit': 'truck',
      'out-for-delivery': 'map-pin',
      'delivered': 'check-circle',
      'cancelled': 'x-circle'
    };
    return statusIcons[status] || 'clock';
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatPrice(price: number): string {
    return `KSh ${price.toLocaleString()}`;
  }

  getWeightCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'light': 'Light (0-1kg)',
      'medium': 'Medium (1-5kg)',
      'heavy': 'Heavy (5-10kg)',
      'extra_heavy': 'Extra Heavy (10kg+)'
    };
    return labels[category] || category;
  }

  getDeliveryTypeLabel(type: string): string {
    const labels: { [key: string]: string } = {
      'standard': 'Standard (3-5 days)',
      'express': 'Express (1-2 days)',
      'same_day': 'Same Day'
    };
    return labels[type] || type;
  }

  clearFilters(): void {
    this.searchForm.patchValue({
      searchTerm: '',
      statusFilter: 'all',
      dateFrom: '',
      dateTo: ''
    });
  }

  exportOrders(): void {
    // Implement export functionality
    console.log('Exporting orders...');
  }

  createNewOrder(): void {
    this.router.navigate(['/admin/create-order']);
  }

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }

  openUpdateStatus(order: Order): void {
    this.orderToUpdate = order;
    this.showUpdateStatusModal = true;
  }

  closeUpdateStatus(): void {
    this.showUpdateStatusModal = false;
    this.orderToUpdate = null;
  }

  handleStatusUpdated(newStatus: string): void {
    if (this.orderToUpdate) {
      // Map frontend status to backend status
      const backendStatusMap: { [key: string]: string } = {
        'pending': 'PENDING',
        'picked-up': 'PENDING',
        'in-transit': 'IN_TRANSIT',
        'out-for-delivery': 'IN_TRANSIT',
        'delivered': 'DELIVERED',
        'cancelled': 'CANCELLED'
      };
      
      const backendStatus = backendStatusMap[newStatus] || 'PENDING';
      
      // Make API call to update status
      this.adminService.updateParcel(this.orderToUpdate.id, { currentStatus: backendStatus }).subscribe({
        next: (response: any) => {
          console.log(`Successfully updated order ${this.orderToUpdate!.id} status to ${newStatus}`);
          this.orderToUpdate!.status = newStatus as any;
          this.orderToUpdate!.updatedAt = new Date();
          this.closeUpdateStatus();
        },
        error: (error: any) => {
          console.error('Error updating order status:', error);
          alert('Failed to update order status. Please try again.');
        }
      });
    }
  }

  // Expose Math object for template
  Math = Math;

  // Track by function for ngFor
  trackByOrderId(index: number, order: Order): string {
    return order.id;
  }

  // Get page numbers for pagination
  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(this.totalPages, 5);
    const startPage = Math.max(1, this.currentPage - 2);
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

  // Get next status for order updates
  getNextStatus(currentStatus: string): string {
    const statusFlow: { [key: string]: string } = {
      'pending': 'picked-up',
      'picked-up': 'in-transit',
      'in-transit': 'out-for-delivery',
      'out-for-delivery': 'delivered'
    };
    return statusFlow[currentStatus] || currentStatus;
  }

  // Helper method to get weight category based on weight
  getWeightCategory(weight: number): string {
    if (weight < 1) return 'light';
    if (weight < 5) return 'medium';
    return 'heavy';
  }

  // Helper method to map backend status to frontend status
  mapStatus(backendStatus: string): 'pending' | 'picked-up' | 'in-transit' | 'out-for-delivery' | 'delivered' | 'cancelled' {
    const statusMap: { [key: string]: any } = {
      'PENDING': 'pending',
      'IN_TRANSIT': 'in-transit',
      'DELIVERED': 'delivered',
      'CANCELLED': 'cancelled'
    };
    return statusMap[backendStatus] || 'pending';
  }
}

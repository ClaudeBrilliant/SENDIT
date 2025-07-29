import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { NotificationService } from '../../../shared/services/notification.service';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  role: 'ADMIN' | 'USER' | 'COURIER';
  parcelsCount: number;
  joinedAt: Date;
  profileImage?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, NotificationComponent],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  editingUser: User | null = null;
  isLoading = false;
  searchForm: FormGroup;
  editForm: FormGroup;
  error: string | null = null;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

    constructor(
    private fb: FormBuilder,
    private router: Router,
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      statusFilter: ['all'],
      roleFilter: ['all']
    });
    
    this.editForm = this.fb.group({
      firstName: [''],
      lastName: [''],
      email: [''],
      phone: [''],
      role: ['USER']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearchListener();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;
    
    this.adminService.getAllUsers().subscribe({
      next: (response: any) => {
        
        // The backend returns the users directly, not wrapped in a data property
        const usersData = Array.isArray(response) ? response : (response.data || []);
        
        // Transform the API response to match our User interface
        this.users = usersData.map((user: any) => ({
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
          email: user.email,
          phone: user.phone || '',
          status: 'active', // All users are active by default
          role: user.role,
          parcelsCount: user.parcelsCount || 0,
          joinedAt: new Date(user.createdAt || Date.now()),
          profileImage: '' // No profile image field in the schema
        }));
        
        this.filteredUsers = [...this.users];
        this.calculatePagination();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.error = 'Failed to load users. Please try again.';
        this.isLoading = false;
        // Fallback to empty array
        this.users = [];
        this.filteredUsers = [];
        this.calculatePagination();
      }
    });
  }

  setupSearchListener(): void {
    this.searchForm.valueChanges.subscribe(() => {
      this.filterUsers();
    });
  }

  filterUsers(): void {
    const { searchTerm, statusFilter, roleFilter } = this.searchForm.value;
    this.filteredUsers = this.users.filter(user => {
      // Search term filter
      const searchMatch = !searchTerm ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase());
      // Status filter
      const statusMatch = statusFilter === 'all' || user.status === statusFilter;
      // Role filter
      const roleMatch = roleFilter === 'all' || user.role === roleFilter;
      return searchMatch && statusMatch && roleMatch;
    });
    this.currentPage = 1;
    this.calculatePagination();
  }

  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredUsers.length / this.itemsPerPage);
  }

  getPaginatedUsers(): User[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    return this.filteredUsers.slice(startIndex, endIndex);
  }

  onPageChange(page: number): void {
    this.currentPage = page;
  }

  onItemsPerPageChange(itemsPerPage: number): void {
    this.itemsPerPage = +itemsPerPage;
    this.currentPage = 1;
    this.calculatePagination();
  }

  viewUserDetails(user: User): void {
    this.selectedUser = user;
  }

  closeUserDetails(): void {
    this.selectedUser = null;
  }

  toggleUserStatus(userId: string): void {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      const newStatus = user.status === 'active' ? 'inactive' : 'active';
      
      // Optimistically update UI
      user.status = newStatus;
      const filteredUser = this.filteredUsers.find(u => u.id === userId);
      if (filteredUser) {
        filteredUser.status = newStatus;
      }
      
      // Make API call to update user status
      this.adminService.updateUser(userId, { status: newStatus }).subscribe({
        next: (response: any) => {
          console.log(`Successfully updated user ${userId} status to ${newStatus}`);
        },
        error: (error: any) => {
          console.error('Error updating user status:', error);
          // Revert the optimistic update on error
          user.status = user.status === 'active' ? 'inactive' : 'active';
          if (filteredUser) {
            filteredUser.status = user.status;
          }
          // You could show a toast notification here
        }
      });
    }
  }

  editUser(user: User): void {
    this.editingUser = user;
    
    // Split the name into firstName and lastName
    const nameParts = user.name.split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Populate the edit form
    this.editForm.patchValue({
      firstName: firstName,
      lastName: lastName,
      email: user.email,
      phone: user.phone,
      role: user.role
    });
  }

  closeEditModal(): void {
    this.editingUser = null;
    this.editForm.reset();
  }

  saveUserChanges(): void {
    if (this.editForm.valid && this.editingUser) {
      const formData = this.editForm.value;
      const updatedUserData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        role: formData.role
      };

      this.adminService.updateUser(this.editingUser.id, updatedUserData).subscribe({
        next: (response: any) => {
          console.log('User updated successfully:', response);
          
          // Update the user in the local array
          const userIndex = this.users.findIndex(u => u.id === this.editingUser!.id);
          if (userIndex !== -1) {
            this.users[userIndex] = {
              ...this.users[userIndex],
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              email: formData.email,
              phone: formData.phone,
              role: formData.role
            };
          }
          
          // Update filtered users as well
          const filteredUserIndex = this.filteredUsers.findIndex(u => u.id === this.editingUser!.id);
          if (filteredUserIndex !== -1) {
            this.filteredUsers[filteredUserIndex] = {
              ...this.filteredUsers[filteredUserIndex],
              name: `${formData.firstName} ${formData.lastName}`.trim(),
              email: formData.email,
              phone: formData.phone,
              role: formData.role
            };
          }
          
          this.closeEditModal();
          this.notificationService.success(
            'User Updated',
            'User updated successfully!'
          );
        },
        error: (error: any) => {
          console.error('Error updating user:', error);
          this.notificationService.error(
            'Update Failed',
            'Failed to update user. Please try again.'
          );
        }
      });
    }
  }

  deleteUser(user: User): void {
    this.notificationService.confirm(
      'Delete User',
      `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`,
      'Delete',
      'Cancel',
      () => {
        // Optimistically remove from UI
        this.users = this.users.filter(u => u.id !== user.id);
        this.filteredUsers = this.filteredUsers.filter(u => u.id !== user.id);
        this.calculatePagination();
        
        // Make API call to delete user
        this.adminService.deleteUser(user.id).subscribe({
          next: (response: any) => {
            this.notificationService.success(
              'User Deleted',
              'User has been deleted successfully.'
            );
          },
          error: (error: any) => {
            console.error('Error deleting user:', error);
            // Revert the optimistic update on error
            this.users.push(user);
            this.filteredUsers.push(user);
            this.calculatePagination();
            this.notificationService.error(
              'Delete Failed',
              'Failed to delete user. Please try again.'
            );
          }
        });
      },
      () => {
        console.log('User deletion cancelled by user');
      }
    );
  }

  clearFilters(): void {
    this.searchForm.patchValue({
      searchTerm: '',
      statusFilter: 'all',
      roleFilter: 'all'
    });
  }

  // Expose Math for template
  Math = Math;

  // Track by function for ngFor
  trackByUserId(index: number, user: User): string {
    return user.id;
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

  goToDashboard(): void {
    this.router.navigate(['/admin/dashboard']);
  }
}

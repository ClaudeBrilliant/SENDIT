import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'active' | 'inactive';
  parcelsCount: number;
  joinedAt: Date;
  profileImage?: string;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  selectedUser: User | null = null;
  isLoading = false;
  searchForm: FormGroup;

  // Pagination
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Mock data
  mockUsers: User[] = [
    {
      id: '1',
      name: 'Michael Johnson',
      email: 'michael@example.com',
      phone: '+254712345678',
      status: 'active',
      parcelsCount: 12,
      joinedAt: new Date('2024-01-10'),
      profileImage: ''
    },
    {
      id: '2',
      name: 'Sarah Wilson',
      email: 'sarah@example.com',
      phone: '+254723456789',
      status: 'active',
      parcelsCount: 8,
      joinedAt: new Date('2024-01-12'),
      profileImage: ''
    },
    {
      id: '3',
      name: 'Robert Davis',
      email: 'robert@example.com',
      phone: '+254734567890',
      status: 'inactive',
      parcelsCount: 5,
      joinedAt: new Date('2024-01-11'),
      profileImage: ''
    }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.searchForm = this.fb.group({
      searchTerm: [''],
      statusFilter: ['all']
    });
  }

  ngOnInit(): void {
    this.loadUsers();
    this.setupSearchListener();
  }

  loadUsers(): void {
    this.isLoading = true;
    setTimeout(() => {
      this.users = [...this.mockUsers];
      this.filteredUsers = [...this.users];
      this.calculatePagination();
      this.isLoading = false;
    }, 1000);
  }

  setupSearchListener(): void {
    this.searchForm.valueChanges.subscribe(() => {
      this.filterUsers();
    });
  }

  filterUsers(): void {
    const { searchTerm, statusFilter } = this.searchForm.value;
    this.filteredUsers = this.users.filter(user => {
      // Search term filter
      const searchMatch = !searchTerm ||
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase());
      // Status filter
      const statusMatch = statusFilter === 'all' || user.status === statusFilter;
      return searchMatch && statusMatch;
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
      user.status = user.status === 'active' ? 'inactive' : 'active';
      // Update filtered users
      const filteredUser = this.filteredUsers.find(u => u.id === userId);
      if (filteredUser) {
        filteredUser.status = user.status;
      }
      // Simulate API call
      console.log(`Toggled status for user ${userId} to ${user.status}`);
    }
  }

  clearFilters(): void {
    this.searchForm.patchValue({
      searchTerm: '',
      statusFilter: 'all'
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

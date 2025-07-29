import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../shared/services/notification.service';
import { NotificationComponent } from '../../../shared/components/notification/notification.component';

export interface Log {
  id: string;
  date: string;
  user: string;
  action: string;
  details: string;
  ipAddress?: string;
  userAgent?: string;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule, NotificationComponent],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent implements OnInit {
  logs: Log[] = [];
  loading = true;
  error: string | null = null;

  constructor(
    private adminService: AdminService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadLogs();
  }

  loadLogs() {
    this.loading = true;
    this.error = null;

    this.adminService.getLogs().subscribe({
      next: (data: any) => {
        console.log('Logs data received:', data);
        this.logs = data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading logs:', error);
        this.error = 'Failed to load logs. Please try again.';
        this.loading = false;
      }
    });
  }

  formatDate(date: string | Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  getActionClass(action: string): string {
    const actionClasses: { [key: string]: string } = {
      'LOGIN': 'action-login',
      'LOGOUT': 'action-logout',
      'CREATE': 'action-create',
      'UPDATE': 'action-update',
      'DELETE': 'action-delete',
      'STATUS_CHANGE': 'action-status',
      'PARCEL_CREATED': 'action-create',
      'PARCEL_UPDATED': 'action-update',
      'PARCEL_DELETED': 'action-delete',
      'USER_CREATED': 'action-create',
      'USER_UPDATED': 'action-update',
      'USER_DELETED': 'action-delete'
    };
    return actionClasses[action] || 'action-default';
  }

  createSampleLogs() {
    this.adminService.createSampleLogs().subscribe({
      next: (response: any) => {
        console.log('Sample logs created:', response);
        this.notificationService.success(
          'Sample Logs Created',
          'Sample logs have been created successfully!'
        );
        this.loadLogs(); // Reload logs to show the new ones
      },
      error: (error) => {
        console.error('Error creating sample logs:', error);
        this.notificationService.error(
          'Failed to Create Logs',
          'Failed to create sample logs. Please try again.'
        );
      }
    });
  }
} 
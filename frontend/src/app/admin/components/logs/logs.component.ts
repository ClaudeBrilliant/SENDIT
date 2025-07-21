import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LogEntry {
  date: string;
  user: string;
  action: string;
  details: string;
}

@Component({
  selector: 'app-logs',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.css']
})
export class LogsComponent {
  logs: LogEntry[] = [
    { date: '2024-06-01 10:15', user: 'Admin', action: 'Login', details: 'Admin logged in successfully.' },
    { date: '2024-06-01 10:17', user: 'Admin', action: 'Update Status', details: 'Parcel #SEND123456 status changed to Delivered.' },
    { date: '2024-06-01 10:20', user: 'John Doe', action: 'Create Order', details: 'Created new parcel order #SEND123457.' },
    { date: '2024-06-01 10:25', user: 'Admin', action: 'Delete User', details: 'Deleted user Jane Smith.' }
  ];
} 
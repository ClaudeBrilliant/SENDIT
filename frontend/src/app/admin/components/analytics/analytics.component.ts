import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent {
  // Mock summary data
  summary = [
    { label: 'Total Orders', value: 1247 },
    { label: 'Delivered', value: 987 },
    { label: 'In Transit', value: 156 },
    { label: 'Pending', value: 89 },
    { label: 'Cancelled', value: 15 }
  ];

  // Mock chart data (could be used with a chart library later)
  ordersPerMonth = [
    { month: 'Jan', value: 120 },
    { month: 'Feb', value: 140 },
    { month: 'Mar', value: 180 },
    { month: 'Apr', value: 160 },
    { month: 'May', value: 200 },
    { month: 'Jun', value: 220 }
  ];
} 
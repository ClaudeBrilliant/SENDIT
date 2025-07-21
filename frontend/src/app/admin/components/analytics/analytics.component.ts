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

  // Pie chart data: order status distribution
  statusDistribution = [
    { label: 'Delivered', value: 987, color: '#4CAF50' },
    { label: 'In Transit', value: 156, color: '#2196F3' },
    { label: 'Pending', value: 89, color: '#FB9F3E' },
    { label: 'Cancelled', value: 15, color: '#F44336' }
  ];

  getPieChartSegments() {
    const total = this.statusDistribution.reduce((sum, s) => sum + s.value, 0);
    let startAngle = 0;
    return this.statusDistribution.map(segment => {
      const angle = (segment.value / total) * 360;
      const endAngle = startAngle + angle;
      const largeArc = angle > 180 ? 1 : 0;
      // Calculate SVG arc
      const x1 = 100 + 100 * Math.cos((Math.PI * startAngle) / 180);
      const y1 = 100 + 100 * Math.sin((Math.PI * startAngle) / 180);
      const x2 = 100 + 100 * Math.cos((Math.PI * endAngle) / 180);
      const y2 = 100 + 100 * Math.sin((Math.PI * endAngle) / 180);
      const path = `M100,100 L${x1},${y1} A100,100 0 ${largeArc},1 ${x2},${y2} Z`;
      const result = { ...segment, path, startAngle, endAngle };
      startAngle = endAngle;
      return result;
    });
  }
} 
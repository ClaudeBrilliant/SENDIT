import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

export interface AnalyticsData {
  overview: {
    totalParcels: number;
    totalUsers: number;
    totalCouriers: number;
    totalRevenue: number;
    averageRevenue: number;
  };
  trends: {
    parcelsThisMonth: number;
    parcelsThisWeek: number;
    parcelsToday: number;
    newUsersThisMonth: number;
    newUsersThisWeek: number;
    newUsersToday: number;
    monthlyRevenue: number;
  };
  status: {
    pending: number;
    inTransit: number;
    delivered: number;
    cancelled: number;
  };
  charts: {
    statusDistribution: Array<{ status: string; count: number }>;
    monthlyTrends: Array<{ date: string; count: number }>;
  };
  locations: {
    topPickup: Array<{ location: string; count: number }>;
    topDelivery: Array<{ location: string; count: number }>;
  };
  performance: {
    activeCouriers: number;
    deliveryRate: number;
    averageDeliveryTime: number;
  };
}

@Component({
  selector: 'app-analytics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics.component.html',
  styleUrls: ['./analytics.component.css']
})
export class AnalyticsComponent implements OnInit, OnDestroy {
  @ViewChild('statusChart') statusChart!: any;
  @ViewChild('trendChart') trendChart!: any;
  @ViewChild('revenueChart') revenueChart!: any;

  analytics: AnalyticsData | null = null;
  loading = true;
  error: string | null = null;

  // Chart instances
  private statusChartInstance: Chart | null = null;
  private trendChartInstance: Chart | null = null;
  private revenueChartInstance: Chart | null = null;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.loadAnalytics();
  }

  loadAnalytics() {
    this.loading = true;
    this.error = null;

    this.adminService.getAnalytics().subscribe({
      next: (data: any) => {
        console.log('Analytics data received:', data);
        this.analytics = data;
        this.loading = false;
        this.initializeCharts();
      },
      error: (error) => {
        console.error('Error loading analytics:', error);
        this.error = 'Failed to load analytics data. Please try again.';
        this.loading = false;
      }
    });
  }

  formatCurrency(amount: number): string {
    return `KSh ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatNumber(num: number): string {
    return num.toLocaleString('en-US');
  }

  formatPercentage(value: number): string {
    return `${value.toFixed(1)}%`;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'PENDING': '#f59e0b',
      'IN_TRANSIT': '#3b82f6',
      'DELIVERED': '#10b981',
      'CANCELLED': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'PENDING': 'Pending',
      'IN_TRANSIT': 'In Transit',
      'DELIVERED': 'Delivered',
      'CANCELLED': 'Cancelled'
    };
    return labels[status] || status;
  }

  calculateStatusPercentage(count: number, total: number): number {
    return total > 0 ? (count / total) * 100 : 0;
  }

  private createStatusPieChart() {
    if (!this.analytics) return;

    const ctx = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy existing chart
    if (this.statusChartInstance) {
      this.statusChartInstance.destroy();
    }

    const data = this.analytics.charts.statusDistribution.map(item => ({
      label: this.getStatusLabel(item.status),
      value: item.count,
      color: this.getStatusColor(item.status)
    }));

    this.statusChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          data: data.map(d => d.value),
          backgroundColor: data.map(d => d.color),
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          },
          title: {
            display: true,
            text: 'Parcel Status Distribution',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        }
      }
    });
  }

  private createTrendLineChart() {
    if (!this.analytics) return;

    const ctx = document.getElementById('trendChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy existing chart
    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }

    const data = this.analytics.charts.monthlyTrends.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: item.count
    }));

    this.trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.date),
        datasets: [{
          label: 'Parcels Created',
          data: data.map(d => d.count),
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Monthly Parcel Trends',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  private createRevenueBarChart() {
    if (!this.analytics) return;

    const ctx = document.getElementById('revenueChart') as HTMLCanvasElement;
    if (!ctx) return;

    // Destroy existing chart
    if (this.revenueChartInstance) {
      this.revenueChartInstance.destroy();
    }

    const data = [
      { label: 'Total Revenue', value: this.analytics.overview.totalRevenue },
      { label: 'Monthly Revenue', value: this.analytics.trends.monthlyRevenue },
      { label: 'Average Revenue', value: this.analytics.overview.averageRevenue }
    ];

    this.revenueChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Revenue (KSh)',
          data: data.map(d => d.value),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ],
          borderColor: [
            '#3b82f6',
            '#10b981',
            '#f59e0b'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          title: {
            display: true,
            text: 'Revenue Analysis',
            font: {
              size: 16,
              weight: 'bold'
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            },
            ticks: {
              callback: function(value) {
                return 'KSh ' + value.toLocaleString();
              }
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    });
  }

  private initializeCharts() {
    setTimeout(() => {
      this.createStatusPieChart();
      this.createTrendLineChart();
      this.createRevenueBarChart();
    }, 100);
  }

  ngOnDestroy() {
    // Clean up chart instances to prevent memory leaks
    if (this.statusChartInstance) {
      this.statusChartInstance.destroy();
    }
    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }
    if (this.revenueChartInstance) {
      this.revenueChartInstance.destroy();
    }
  }
} 
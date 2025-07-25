import { Component } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-track-parcel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './track-parcel.component.html',
  styleUrls: ['./track-parcel.component.css']
})
export class AdminTrackParcelComponent {
  trackingNumber = '';
  parcel: any = null;
  loading = false;

  constructor(private adminService: AdminService) {}

  trackParcel() {
    if (!this.trackingNumber) return;
    this.loading = true;
    this.adminService.trackParcel(this.trackingNumber).subscribe(data => {
      this.parcel = data;
      this.loading = false;
    });
  }
} 
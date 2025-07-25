import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-parcels',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './parcels.component.html',
  styleUrls: ['./parcels.component.css']
})
export class ParcelsComponent implements OnInit {
  parcels: any[] = [];
  loading = true;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getAllParcels().subscribe(data => {
      this.parcels = data as any[];
      this.loading = false;
    });
  }

  viewParcel(parcel: any) {}
  editParcel(parcel: any) {}
  deleteParcel(parcel: any) {}
} 
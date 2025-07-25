import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit {
  settings: any = {};
  loading = true;
  saving = false;

  constructor(private adminService: AdminService) {}

  ngOnInit() {
    this.adminService.getSettings().subscribe(data => {
      this.settings = data;
      this.loading = false;
    });
  }

  saveSettings() {
    this.saving = true;
    this.adminService.updateSettings(this.settings).subscribe(() => {
      this.saving = false;
      // Optionally show a success message
    });
  }
} 
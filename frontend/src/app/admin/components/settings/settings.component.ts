import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent {
  profile = {
    name: 'Admin User',
    email: 'admin@example.com',
    phone: '+254700000000'
  };
  notifications = {
    email: true,
    sms: false
  };
  system = {
    darkMode: false
  };
  saveSettings() {
    // Mock save
    alert('Settings saved!');
  }
} 
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  user = {
    avatar: '/assets/images/default-avatar.png',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890'
  };

  profileForm: FormGroup;
  editing = false;

  constructor(private fb: FormBuilder) {
    this.profileForm = this.fb.group({
      firstName: [this.user.firstName],
      lastName: [this.user.lastName],
      email: [this.user.email],
      phone: [this.user.phone]
    });
  }

  enableEdit() {
    this.editing = true;
  }

  saveProfile() {
    this.user = { ...this.user, ...this.profileForm.value };
    this.editing = false;
  }
}

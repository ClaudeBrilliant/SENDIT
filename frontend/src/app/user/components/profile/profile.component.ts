import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { UserService, User, UpdateUserDto } from '../../services/user.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  profileForm: FormGroup;
  editing = false;
  isLoading = false;
  isUploading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.profileForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.checkUserLogin();
    this.loadUserProfile();
  }

  checkUserLogin(): void {
    const userData = localStorage.getItem('user');
    if (!userData) {
      this.errorMessage = 'Please log in to view your profile';
      return;
    }
    
    try {
      const user = JSON.parse(userData);
      if (!user.id) {
        this.errorMessage = 'Invalid user data. Please log in again.';
      }
    } catch (error) {
      this.errorMessage = 'Invalid user data. Please log in again.';
    }
  }

  loadUserProfile(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    try {
      this.userService.getCurrentUser().subscribe({
        next: (user) => {
          console.log('User profile loaded:', user);
          this.user = user;
          this.profileForm.patchValue({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
          });
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          // Fallback to localStorage data
          const userData = localStorage.getItem('user');
          if (userData) {
            try {
              const localUser = JSON.parse(userData);
              this.user = {
                id: localUser.id,
                firstName: localUser.firstName || localUser.name?.split(' ')[0] || '',
                lastName: localUser.lastName || localUser.name?.split(' ').slice(1).join(' ') || '',
                email: localUser.email,
                phone: localUser.phone || '',
                role: localUser.role || 'USER',
                profileImage: localUser.profileImage,
                createdAt: localUser.createdAt || new Date().toISOString(),
                updatedAt: localUser.updatedAt || new Date().toISOString()
              };
              this.profileForm.patchValue({
                firstName: this.user.firstName,
                lastName: this.user.lastName,
                email: this.user.email,
                phone: this.user.phone
              });
              this.errorMessage = 'Using cached profile data. Some features may be limited.';
            } catch (parseError) {
              this.errorMessage = error.error?.message || error.message || 'Failed to load profile data';
            }
          } else {
            this.errorMessage = error.error?.message || error.message || 'Failed to load profile data';
          }
          this.isLoading = false;
        }
      });
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
      this.errorMessage = error instanceof Error ? error.message : 'Failed to load profile data';
      this.isLoading = false;
    }
  }

  enableEdit(): void {
    this.editing = true;
    this.errorMessage = '';
    this.successMessage = '';
  }

  cancelEdit(): void {
    this.editing = false;
    this.profileForm.patchValue({
      firstName: this.user?.firstName || '',
      lastName: this.user?.lastName || '',
      email: this.user?.email || '',
      phone: this.user?.phone || ''
    });
    this.errorMessage = '';
    this.successMessage = '';
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.user) {
      this.isLoading = true;
      const updateData: UpdateUserDto = this.profileForm.value;
      
      this.userService.updateProfile(this.user.id, updateData).subscribe({
        next: (updatedUser) => {
          this.user = updatedUser;
          this.editing = false;
          this.isLoading = false;
          this.successMessage = 'Profile updated successfully!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Error updating profile:', error);
          this.errorMessage = error.error?.message || 'Failed to update profile';
          this.isLoading = false;
        }
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    console.log('File selected:', file);
    
    if (file && this.user) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage = 'Please select a valid image file (JPEG, PNG, or WebP)';
        return;
      }
      // Validate file size (2MB max)
      if (file.size > 2 * 1024 * 1024) {
        this.errorMessage = 'File size must be less than 2MB';
        return;
      }
      this.isUploading = true;
      this.errorMessage = '';
      this.successMessage = '';
      console.log('Uploading file for user:', this.user.id);
      this.userService.uploadProfileImage(this.user.id, file).subscribe({
        next: (result) => {
          console.log('Upload successful:', result);
          if (this.user) {
            this.user.profileImage = result.imageUrl;
            // Update localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
              const userObj = JSON.parse(userData);
              userObj.profileImage = result.imageUrl;
              localStorage.setItem('user', JSON.stringify(userObj));
            }
          }
          this.isUploading = false;
          this.successMessage = 'Profile image uploaded successfully!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Error uploading image:', error);
          this.errorMessage = error.error?.message || 'Failed to upload image';
          this.isUploading = false;
        }
      });
    } else {
      console.error('No file selected or user not found');
      this.errorMessage = 'Please select a file to upload';
    }
  }

  deleteProfileImage(): void {
    if (this.user && this.user.profileImage) {
      this.isUploading = true;
      this.errorMessage = '';
      this.userService.deleteProfileImage(this.user.id).subscribe({
        next: () => {
          if (this.user) {
            this.user.profileImage = undefined;
            // Update localStorage
            const userData = localStorage.getItem('user');
            if (userData) {
              const userObj = JSON.parse(userData);
              userObj.profileImage = undefined;
              localStorage.setItem('user', JSON.stringify(userObj));
            }
          }
          this.isUploading = false;
          this.successMessage = 'Profile image removed successfully!';
          setTimeout(() => this.successMessage = '', 3000);
        },
        error: (error) => {
          console.error('Error deleting image:', error);
          this.errorMessage = error.error?.message || 'Failed to delete image';
          this.isUploading = false;
        }
      });
    }
  }

  getUserInitials(): string {
    if (this.user) {
      return this.userService.getUserInitials(this.user.firstName, this.user.lastName);
    }
    return '';
  }

  getAvatarColor(): string {
    if (this.user) {
      return this.userService.getAvatarColor(this.user.firstName, this.user.lastName);
    }
    return '#FF6B6B';
  }

  getErrorMessage(fieldName: string): string {
    const field = this.profileForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['email']) {
        return 'Please enter a valid email address';
      }
    }
    return '';
  }
}

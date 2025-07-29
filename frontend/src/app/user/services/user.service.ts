import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getCurrentUser(): Observable<User> {
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);
    
    if (!userData) {
      console.error('No user data found in localStorage');
      throw new Error('User not logged in');
    }
    
    try {
      const user = JSON.parse(userData);
      console.log('Parsed user data:', user);
      const userId = user.id;
      if (!userId) {
        console.error('No user ID found in user data');
        throw new Error('User ID not found');
      }
      console.log('Making API call to get user with ID:', userId);
      return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
    } catch (error) {
      console.error('Error parsing user data:', error);
      throw new Error('Invalid user data in localStorage');
    }
  }

  updateProfile(userId: string, data: UpdateUserDto): Observable<User> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.patch<User>(`${this.apiUrl}/users/${userId}`, data, { headers });
  }

  uploadProfileImage(userId: string, file: File): Observable<{ imageUrl: string }> {
    const token = localStorage.getItem('access_token');
    console.log('JWT Token available:', !!token);
    console.log('Token length:', token?.length);
    
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('uploadType', 'USER_PROFILE');
    
    console.log('Uploading image for user:', userId);
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });
    console.log('FormData entries:');
    for (const [key, value] of formData.entries()) {
      console.log(key, value);
    }
    
    return this.http.post<{ imageUrl: string }>(`${this.apiUrl}/users/${userId}/upload-image`, formData, { headers });
  }

  deleteProfileImage(userId: string): Observable<void> {
    const token = localStorage.getItem('access_token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}/profile-image`, { headers });
  }

  // Helper method to get user initials
  getUserInitials(firstName: string, lastName: string): string {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  }

  // Helper method to get avatar color based on user name
  getAvatarColor(firstName: string, lastName: string): string {
    const colors = [
      '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
      '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
    ];
    const name = `${firstName}${lastName}`;
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }
}


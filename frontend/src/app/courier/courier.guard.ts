import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class CourierGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    // Example: check localStorage for user role
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.role === 'COURIER') {
      return true;
    }
    // Redirect to login or home if not courier
    this.router.navigate(['/login']);
    return false;
  }
} 
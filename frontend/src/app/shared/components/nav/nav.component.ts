import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit {
  isMobileMenuOpen = false;
  isScrolled = false;
  isLoggedIn = false;
  userRole = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.checkLoginStatus();
    // Listen for storage changes to update login status
    window.addEventListener('storage', () => {
      this.checkLoginStatus();
    });
  }

  checkLoginStatus(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      this.isLoggedIn = true;
      try {
        const userData = JSON.parse(user);
        this.userRole = userData.role || '';
      } catch (e) {
        this.userRole = '';
      }
    } else {
      this.isLoggedIn = false;
      this.userRole = '';
    }
  }

  refreshLoginStatus(): void {
    this.checkLoginStatus();
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.isLoggedIn = false;
    this.userRole = '';
    this.router.navigate(['/']);
  }

  getDashboardRoute(): string {
    switch (this.userRole) {
      case 'ADMIN':
        return '/admin/dashboard';
      case 'COURIER':
        return '/courier/dashboard';
      default:
        return '/user/dashboard';
    }
  }

  navigateToDashboard(): void {
    this.router.navigate([this.getDashboardRoute()]);
    this.isMobileMenuOpen = false;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 50;
  }

  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
    this.isMobileMenuOpen = false;
  }

  navigateToSignup(): void {
    console.log('Signup button clicked');
    this.router.navigate(['/auth/register']);
    this.isMobileMenuOpen = false;
  }

  navigateToHome(): void {
    this.router.navigate(['/']);
    this.isMobileMenuOpen = false;
  }

  navigateToServices(): void {
    this.router.navigate(['/services']);
    this.isMobileMenuOpen = false;
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
    this.isMobileMenuOpen = false;
  }

  navigateToTrackParcel(): void {
    this.router.navigate(['/track-parcel']);
    this.isMobileMenuOpen = false;
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
    this.isMobileMenuOpen = false;
  }

  navigateToFaqs(): void {
    this.router.navigate(['/faqs']);
    this.isMobileMenuOpen = false;
  }
} 
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthStateService, AuthState } from '../../services/auth-state.service';

@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  isScrolled = false;
  isLoggedIn = false;
  userRole = '';
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private authStateService: AuthStateService
  ) {}

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authSubscription = this.authStateService.authState$.subscribe(
      (authState: AuthState) => {
        this.isLoggedIn = authState.isLoggedIn;
        this.userRole = authState.userRole;
      }
    );

    // Listen for storage changes to update login status (for cross-tab synchronization)
    window.addEventListener('storage', () => {
      this.authStateService.checkInitialAuthState();
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authStateService.logout();
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
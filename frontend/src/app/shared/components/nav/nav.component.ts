import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthStateService, AuthState } from '../../services/auth-state.service';
import { NotificationApiService, Notification } from '../../services/notification-api.service';

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
  notifications: Notification[] = [];
  unreadCount = 0;
  showNotificationDropdown = false;
  private authSubscription?: Subscription;

  constructor(
    private router: Router,
    private authStateService: AuthStateService,
    private notificationApiService: NotificationApiService
  ) {}

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.notification-container')) {
      this.showNotificationDropdown = false;
    }
  }

  ngOnInit(): void {
    // Subscribe to auth state changes
    this.authSubscription = this.authStateService.authState$.subscribe(
      (authState: AuthState) => {
        this.isLoggedIn = authState.isLoggedIn;
        this.userRole = authState.userRole;
        
        // Load notifications when user is logged in
        if (this.isLoggedIn && authState.user?.id) {
          this.loadNotifications(authState.user.id);
        } else {
          this.notifications = [];
          this.unreadCount = 0;
        }
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

  loadNotifications(userId: string): void {
    this.notificationApiService.getUserNotifications(userId).subscribe({
      next: (notifications) => {
        // Only keep unread notifications in the list
        this.notifications = notifications.filter(n => !n.isRead);
        this.unreadCount = this.notifications.length;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
      }
    });
  }

  toggleNotificationDropdown(event: Event): void {
    event.stopPropagation();
    this.showNotificationDropdown = !this.showNotificationDropdown;
  }

  markAsRead(notificationId: string): void {
    this.notificationApiService.markAsRead(notificationId).subscribe({
      next: (updatedNotification) => {
        // Remove the notification from the local array when marked as read
        this.notifications = this.notifications.filter(n => n.id !== notificationId);
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
      },
      error: (error) => {
        console.error('Error marking notification as read:', error);
      }
    });
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
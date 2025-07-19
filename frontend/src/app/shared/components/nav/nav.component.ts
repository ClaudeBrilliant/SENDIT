import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-nav',
  standalone: true,
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})
export class NavComponent {
  isMobileMenuOpen = false;
  isScrolled = false;

  constructor(private router: Router) {}

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

  navigateToContact(): void {
    this.router.navigate(['/contact']);
    this.isMobileMenuOpen = false;
  }

  navigateToFaqs(): void {
    this.router.navigate(['/faqs']);
    this.isMobileMenuOpen = false;
  }

  navigateToDashboard(): void {
    this.router.navigate(['/user/dashboard']);
    this.isMobileMenuOpen = false;
  }
} 
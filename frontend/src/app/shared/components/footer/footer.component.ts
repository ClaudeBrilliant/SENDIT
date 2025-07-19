import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();

  constructor(private router: Router) {}

  navigateToHome(): void {
    this.router.navigate(['/']);
  }

  navigateToServices(): void {
    this.router.navigate(['/services']);
  }

  navigateToTrack(): void {
    this.router.navigate(['/track']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }

  navigateToPrivacy(): void {
    this.router.navigate(['/privacy']);
  }

  navigateToTerms(): void {
    this.router.navigate(['/terms']);
  }
} 
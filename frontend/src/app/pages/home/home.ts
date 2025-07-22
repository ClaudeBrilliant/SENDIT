import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';
import { AboutComponent } from "../../shared/components/about/about.component";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [NavComponent, FooterComponent, AboutComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class HomeComponent implements OnInit {
  
  // Animation states
  isLoaded = false;
  
  // Statistics data
  stats = {
    deliveries: 10000,
    clients: 500,
    support: '24/7'
  };

  // Features data
  features = [
    {
      icon: 'shield',
      title: 'Real-time Tracking',
      description: 'Track your packages in real-time with GPS location updates and instant notifications.',
      color: 'bg-blue-500'
    },
    {
      icon: 'clock',
      title: 'Fast Delivery',
      description: 'Same-day and next-day delivery options available for urgent packages.',
      color: 'bg-green-500'
    },
    {
      icon: 'check-circle',
      title: 'Secure & Reliable',
      description: 'Your packages are insured and handled by our trusted courier partners.',
      color: 'bg-purple-500'
    }
  ];

  constructor(private router: Router) { }

  ngOnInit(): void {
    // Trigger animations after component loads
    setTimeout(() => {
      this.isLoaded = true;
    }, 100);
  }

  // Navigation methods
  navigateToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  navigateToSignup(): void {
    this.router.navigate(['/auth/signup']);
  }

  navigateToSendPackage(): void {
    this.router.navigate(['/user/send-package']);
  }

  navigateToTrackPackage(): void {
    this.router.navigate(['/user/track-package']);
  }

  navigateToServices(): void {
    this.router.navigate(['/services']);
  }

  navigateToAbout(): void {
    this.router.navigate(['/about']);
  }

  // Utility methods
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // Analytics tracking (placeholder)
  trackButtonClick(buttonName: string): void {
    console.log(`Button clicked: ${buttonName}`);
    // Add analytics tracking here
  }

  // Animation trigger methods
  onHeroButtonClick(action: string): void {
    this.trackButtonClick(action);
    
    if (action === 'send-package') {
      this.navigateToSendPackage();
    } else if (action === 'track-package') {
      this.navigateToTrackPackage();
    }
  }

  onCtaButtonClick(): void {
    this.trackButtonClick('get-started-cta');
    this.navigateToSendPackage();
  }

  // Feature interaction
  onFeatureClick(feature: any): void {
    console.log('Feature clicked:', feature.title);
    // Handle feature click - maybe show modal or navigate
  }

  // Statistics counter animation (optional enhancement)
  animateCounter(targetValue: number, element: HTMLElement): void {
    let currentValue = 0;
    const increment = targetValue / 100;
    const timer = setInterval(() => {
      currentValue += increment;
      if (currentValue >= targetValue) {
        currentValue = targetValue;
        clearInterval(timer);
      }
      element.textContent = Math.floor(currentValue).toLocaleString();
    }, 20);
  }

  // Handle mobile menu toggle
  isMobileMenuOpen = false;
  
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  // Handle scroll events for navbar styling
  isScrolled = false;

  onWindowScroll(): void {
    this.isScrolled = window.pageYOffset > 50;
  }

  // Newsletter subscription (placeholder)
  subscribeToNewsletter(email: string): void {
    console.log('Newsletter subscription:', email);
    // Implement newsletter subscription logic
  }

  // Contact form submission (placeholder)
  submitContactForm(formData: any): void {
    console.log('Contact form submitted:', formData);
    // Implement contact form submission logic
  }
}
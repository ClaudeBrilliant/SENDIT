import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavComponent, FooterComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  stats = [
    { number: '10K+', label: 'Happy Customers' },
    { number: '50K+', label: 'Packages Delivered' },
    { number: '200+', label: 'Countries Served' },
    { number: '99.9%', label: 'Delivery Success Rate' }
  ];

  values = [
    {
      icon: '🚀',
      title: 'Innovation',
      description: 'We constantly innovate to provide the best delivery experience using cutting-edge technology.'
    },
    {
      icon: '🤝',
      title: 'Reliability',
      description: 'Your trust is our priority. We deliver on our promises, every single time.'
    },
    {
      icon: '🌱',
      title: 'Sustainability',
      description: 'We\'re committed to eco-friendly practices and reducing our carbon footprint.'
    },
    {
      icon: '💙',
      title: 'Customer First',
      description: 'Every decision we make is centered around providing exceptional customer service.'
    }
  ];

  timeline = [
    {
      year: '2020',
      title: 'Company Founded',
      description: 'SendIT was founded with a vision to revolutionize the delivery industry.'
    },
    {
      year: '2021',
      title: 'First 1000 Customers',
      description: 'Reached our first milestone of 1000 satisfied customers across the country.'
    },
    {
      year: '2022',
      title: 'International Expansion',
      description: 'Expanded our services to over 50 countries worldwide.'
    },
    {
      year: '2023',
      title: 'Technology Innovation',
      description: 'Launched our advanced tracking system and mobile app.'
    },
    {
      year: '2024',
      title: 'Market Leader',
      description: 'Became the leading delivery service provider with 10K+ customers.'
    }
  ];

  team = [
    {
      name: 'Alex Johnson',
      position: 'CEO & Founder',
      image: 'assets/images/team/ceo.jpg',
      bio: 'Former logistics executive with 15+ years of experience in the delivery industry.',
      linkedin: '#'
    },
    {
      name: 'Sarah Chen',
      position: 'CTO',
      image: 'assets/images/team/cto.jpg',
      bio: 'Tech enthusiast leading our digital transformation and innovation initiatives.',
      linkedin: '#'
    },
    {
      name: 'Mike Rodriguez',
      position: 'Head of Operations',
      image: 'assets/images/team/operations.jpg',
      bio: 'Operations expert ensuring smooth delivery processes and customer satisfaction.',
      linkedin: '#'
    },
    {
      name: 'Emily Davis',
      position: 'Head of Customer Success',
      image: 'assets/images/team/customer-success.jpg',
      bio: 'Customer advocate dedicated to providing exceptional service and support.',
      linkedin: '#'
    }
  ];

  achievements = [
    {
      icon: '🏆',
      title: 'Best Delivery Service 2023',
      description: 'Awarded by Logistics Excellence Association'
    },
    {
      icon: '⭐',
      title: '5-Star Customer Rating',
      description: 'Consistently rated 5 stars by our customers'
    },
    {
      icon: '🌍',
      title: 'Global Reach',
      description: 'Serving customers in over 200 countries'
    },
    {
      icon: '🔒',
      title: 'Security Certified',
      description: 'ISO 27001 certified for data security'
    }
  ];

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
} 
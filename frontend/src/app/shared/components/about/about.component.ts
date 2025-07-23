import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavComponent } from '../nav/nav.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, NavComponent],
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
   
      title: 'Innovation',
      description: 'We constantly innovate to provide the best delivery experience using cutting-edge technology.'
    },
    {
    
      title: 'Reliability',
      description: 'Your trust is our priority. We deliver on our promises, every single time.'
    },
    {
     
      title: 'Sustainability',
      description: 'We\'re committed to eco-friendly practices and reducing our carbon footprint.'
    },
    {
      
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
      name: 'Adewale Adebayo',
      position: 'CEO & Founder',
      image: '../../../assets/images/ceo.jpeg',
      bio: 'Visionary leader with a passion for logistics and 15+ years of industry experience.',
      linkedin: '#'
    },
    {
      name: 'Fatima Aliyu',
      position: 'Chief Technology Officer',
      image: '../../../assets/images/ceo.jpeg',
      bio: 'Expert in scalable tech solutions, driving our digital-first approach.',
      linkedin: '#'
    },
    {
      name: 'Kwame Osei',
      position: 'Head of Operations',
      image: '../../../assets/images/ceo.jpeg',
      bio: 'Master of efficiency, ensuring seamless and timely deliveries for all our clients.',
      linkedin: '#'
    },
  ];

  achievements = [
    {
     
      title: 'Best Delivery Service 2023',
      description: 'Awarded by Logistics Excellence Association'
    },
    {
   
      title: '5-Star Customer Rating',
      description: 'Consistently rated 5 stars by our customers'
    },
    {
    
      title: 'Global Reach',
      description: 'Serving customers in over 200 countries'
    },
    {
     
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
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NavComponent } from '../../shared/components/nav/nav.component';
import { FooterComponent } from '../../shared/components/footer/footer.component';

@Component({
  selector: 'app-faqs',
  standalone: true,
  imports: [CommonModule, FormsModule, NavComponent, FooterComponent],
  templateUrl: './faqs.component.html',
  styleUrls: ['./faqs.component.css']
})
export class FaqsComponent {
  searchTerm = '';
  activeCategory = 'all';
  expandedItems: Set<number> = new Set();

  categories = [
    { id: 'all', name: 'All Questions', icon: '📋' },
    { id: 'shipping', name: 'Shipping & Delivery', icon: '📦' },
    { id: 'tracking', name: 'Tracking & Updates', icon: '📍' },
    { id: 'pricing', name: 'Pricing & Payment', icon: '💰' },
    { id: 'account', name: 'Account & Security', icon: '🔐' },
    { id: 'support', name: 'Support & Help', icon: '🆘' }
  ];

  faqs = [
    {
      id: 1,
      category: 'shipping',
      question: 'How long does delivery take?',
      answer: 'Delivery times vary based on your location and the service you choose. Standard delivery typically takes 3-5 business days, while express delivery can be as fast as 1-2 business days. International shipping may take 7-14 business days.'
    },
    {
      id: 2,
      category: 'shipping',
      question: 'What are the delivery options available?',
      answer: 'We offer several delivery options: Standard Delivery (3-5 business days), Express Delivery (1-2 business days), Same-Day Delivery (available in select areas), and International Shipping. You can choose the option that best fits your timeline and budget.'
    },
    {
      id: 3,
      category: 'tracking',
      question: 'How can I track my package?',
      answer: 'You can track your package in several ways: 1) Use the tracking number provided in your confirmation email, 2) Log into your account and view your order history, 3) Use our mobile app for real-time updates, 4) Contact our customer service team.'
    },
    {
      id: 4,
      category: 'tracking',
      question: 'Will I receive delivery notifications?',
      answer: 'Yes! We send notifications at key points: when your package is picked up, when it\'s in transit, when it\'s out for delivery, and when it\'s delivered. You can choose to receive notifications via email, SMS, or push notifications through our app.'
    },
    {
      id: 5,
      category: 'pricing',
      question: 'How are shipping costs calculated?',
      answer: 'Shipping costs are calculated based on several factors: package weight and dimensions, delivery distance, service level (standard vs express), and any special handling requirements. You can get an instant quote by entering your package details and destination.'
    },
    {
      id: 6,
      category: 'pricing',
      question: 'Do you offer any discounts or promotions?',
      answer: 'Yes! We regularly offer promotions including: 10% off for first-time customers, bulk shipping discounts, seasonal promotions, and loyalty rewards for frequent shippers. Sign up for our newsletter to stay updated on the latest offers.'
    },
    {
      id: 7,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Creating an account is easy! Click the "Sign Up" button on our homepage, fill in your details (name, email, password), verify your email address, and you\'re ready to start shipping. You can also sign up using your Google or Facebook account.'
    },
    {
      id: 8,
      category: 'account',
      question: 'Is my personal information secure?',
      answer: 'Absolutely! We use industry-standard encryption to protect your personal and payment information. We never share your data with third parties without your consent, and we comply with all relevant data protection regulations.'
    },
    {
      id: 9,
      category: 'support',
      question: 'What if my package is lost or damaged?',
      answer: 'We provide comprehensive insurance for all packages. If your package is lost or damaged, contact our customer service team within 30 days of the expected delivery date. We\'ll investigate and process your claim, typically resolving issues within 5-7 business days.'
    },
    {
      id: 10,
      category: 'support',
      question: 'How can I contact customer support?',
      answer: 'Our customer support team is available 24/7 through multiple channels: Live chat on our website, phone support at +1 (555) 123-4567, email at support@sendit.com, and through our mobile app. We typically respond within 2 hours.'
    },
    {
      id: 11,
      category: 'shipping',
      question: 'What items are prohibited from shipping?',
      answer: 'We cannot ship hazardous materials, illegal items, perishable goods, live animals, or items that exceed our size and weight limits. For a complete list of prohibited items, please check our shipping guidelines or contact our support team.'
    },
    {
      id: 12,
      category: 'tracking',
      question: 'Can I change the delivery address after shipping?',
      answer: 'Yes, you can request an address change for a small fee, but only if the package hasn\'t been delivered yet. Contact our customer service team with your tracking number and new address. Changes are subject to approval and may affect delivery time.'
    }
  ];

  get filteredFaqs() {
    return this.faqs.filter(faq => {
      const matchesCategory = this.activeCategory === 'all' || faq.category === this.activeCategory;
      const matchesSearch = this.searchTerm === '' || 
        faq.question.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }

  toggleItem(id: number): void {
    if (this.expandedItems.has(id)) {
      this.expandedItems.delete(id);
    } else {
      this.expandedItems.add(id);
    }
  }

  setCategory(categoryId: string): void {
    this.activeCategory = categoryId;
  }

  clearSearch(): void {
    this.searchTerm = '';
  }

  isExpanded(id: number): boolean {
    return this.expandedItems.has(id);
  }

  getCategoryIcon(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.icon : '📋';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : '';
  }

  trackByFaqId(index: number, faq: any): number {
    return faq.id;
  }
} 
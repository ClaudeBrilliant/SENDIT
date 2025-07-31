import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

export interface Review {
  id: string;
  userId: string;
  parcelId: string;
  rating: number;
  comment: string;
  createdAt: string;
  userName: string;
  parcelTrackingNumber: string;
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.css']
})
export class ReviewsComponent implements OnInit {
  @Input() parcelId?: string; // Optional input for specific parcel
  
  reviews: Review[] = [];
  userReviews: Review[] = [];
  loading = false;
  submitting = false;
  error: string | null = null;
  successMessage = '';

  reviewForm: FormGroup;
  selectedParcel: any = null;
  availableParcels: any[] = [];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient
  ) {
    this.reviewForm = this.fb.group({
      parcelId: ['', Validators.required],
      rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
      comment: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]]
    });
  }

  ngOnInit() {
    if (this.parcelId) {
      // If parcelId is provided, focus on that specific parcel
      this.loadReviewsForParcel(this.parcelId);
      this.loadParcelDetails(this.parcelId);
      this.reviewForm.patchValue({ parcelId: this.parcelId });
    } else {
      // Otherwise, load all reviews and available parcels
      this.loadReviews();
      this.loadUserParcels();
    }
  }

  loadReviewsForParcel(parcelId: string) {
    this.loading = true;
    this.http.get<Review[]>(`http://localhost:3000/reviews/parcel/${parcelId}`).subscribe({
      next: (reviews) => {
        this.reviews = reviews || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews for parcel:', error);
        this.error = 'Failed to load reviews';
        this.loading = false;
      }
    });
  }

  loadParcelDetails(parcelId: string) {
    this.http.get<any>(`http://localhost:3000/parcels/${parcelId}`).subscribe({
      next: (parcel) => {
        this.selectedParcel = parcel;
      },
      error: (error) => {
        console.error('Error loading parcel details:', error);
      }
    });
  }

  loadReviews() {
    this.loading = true;
    this.http.get<Review[]>('http://localhost:3000/reviews').subscribe({
      next: (reviews) => {
        this.reviews = reviews || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading reviews:', error);
        this.error = 'Failed to load reviews';
        this.loading = false;
      }
    });
  }

  loadUserParcels() {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.id) {
      this.http.get<any[]>(`http://localhost:3000/parcels/user/${user.id}`).subscribe({
        next: (parcels) => {
          // Filter for delivered parcels that haven't been reviewed
          this.availableParcels = parcels?.filter(p => 
            p.currentStatus === 'DELIVERED' && !this.hasUserReviewed(p.id)
          ) || [];
        },
        error: (error) => {
          console.error('Error loading user parcels:', error);
        }
      });
    }
  }

  hasUserReviewed(parcelId: string): boolean {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return this.userReviews.some(review => 
      review.parcelId === parcelId && review.userId === user.id
    );
  }

  onSubmit() {
    if (this.reviewForm.valid) {
      this.submitting = true;
      this.error = '';
      this.successMessage = '';

      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const reviewData = {
        ...this.reviewForm.value,
        userId: user.id
      };

      this.http.post<Review>('http://localhost:3000/reviews', reviewData).subscribe({
        next: (review) => {
          this.successMessage = 'Review submitted successfully!';
          this.reviewForm.reset();
          this.reviewForm.patchValue({ rating: 5 });
          this.loadReviews();
          this.loadUserParcels();
          this.submitting = false;
        },
        error: (error) => {
          console.error('Error submitting review:', error);
          this.error = 'Failed to submit review. Please try again.';
          this.submitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.reviewForm.controls).forEach(key => {
      const control = this.reviewForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.reviewForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      }
      if (field.errors['minlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors['maxlength']) {
        return `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} must be no more than ${field.errors['maxlength'].requiredLength} characters`;
      }
      if (field.errors['min']) {
        return 'Rating must be at least 1';
      }
      if (field.errors['max']) {
        return 'Rating must be no more than 5';
      }
    }
    return '';
  }

  getStarClass(rating: number, starValue: number): string {
    return rating >= starValue ? 'star-filled' : 'star-empty';
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getAverageRating(): number {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    return Math.round((total / this.reviews.length) * 10) / 10;
  }

  getRatingCount(rating: number): number {
    return this.reviews.filter(review => review.rating === rating).length;
  }

  getRatingPercentage(rating: number): number {
    if (this.reviews.length === 0) return 0;
    return (this.getRatingCount(rating) / this.reviews.length) * 100;
  }
} 
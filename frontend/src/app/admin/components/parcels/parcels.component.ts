import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { CommonModule } from '@angular/common';

export interface Parcel {
  id: string;
  trackingNumber: string;
  sender: string;
  receiver: string;
  status: string;
  createdAt: string;
  weight?: number;
  price?: number;
  pickupLocation?: string;
  deliveryLocation?: string;
}

@Component({
  selector: 'app-parcels',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './parcels.component.html',
  styleUrls: ['./parcels.component.css']
})
export class ParcelsComponent implements OnInit {
  parcels: Parcel[] = [];
  loading = true;
  error: string | null = null;
  selectedParcel: Parcel | null = null;
  editingParcel: Parcel | null = null;
  editForm: FormGroup;

  constructor(
    private adminService: AdminService,
    private fb: FormBuilder
  ) {
    this.editForm = this.fb.group({
      sender: [''],
      receiver: [''],
      weight: [0],
      price: [0],
      status: ['PENDING']
    });
  }

  ngOnInit() {
    this.loadParcels();
  }

  loadParcels() {
    this.loading = true;
    this.error = null;
    
    this.adminService.getAllParcels().subscribe({
      next: (data: any) => {
        console.log('Parcels data received:', data); // Debug log
        this.parcels = data || [];
        console.log('Parcels array:', this.parcels); // Debug log
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading parcels:', error);
        this.error = 'Failed to load parcels. Please try again.';
        this.loading = false;
      }
    });
  }

  viewParcel(parcel: Parcel) {
    this.selectedParcel = parcel;
    console.log('Viewing parcel:', parcel);
  }

  closeParcelDetails() {
    this.selectedParcel = null;
  }

  editParcel(parcel: Parcel) {
    this.editingParcel = parcel;
    
    // Populate the edit form
    this.editForm.patchValue({
      sender: parcel.sender,
      receiver: parcel.receiver,
      weight: parcel.weight || 0,
      price: parcel.price || 0,
      status: parcel.status || 'PENDING'
    });
  }

  closeEditModal() {
    this.editingParcel = null;
    this.editForm.reset();
  }

  saveParcelChanges() {
    if (this.editForm.valid && this.editingParcel) {
      const formData = this.editForm.value;
      const updatedParcelData = {
        weight: formData.weight,
        price: formData.price,
        currentStatus: formData.status
      };

      this.adminService.updateParcel(this.editingParcel.id, updatedParcelData).subscribe({
        next: (response: any) => {
          console.log('Parcel updated successfully:', response);
          
          // Update the parcel in the local array
          const parcelIndex = this.parcels.findIndex(p => p.id === this.editingParcel!.id);
          if (parcelIndex !== -1) {
            this.parcels[parcelIndex] = {
              ...this.parcels[parcelIndex],
              sender: formData.sender,
              receiver: formData.receiver,
              weight: formData.weight,
              price: formData.price,
              status: formData.status
            };
          }
          
          this.closeEditModal();
          alert('Parcel updated successfully!');
        },
        error: (error: any) => {
          console.error('Error updating parcel:', error);
          alert('Failed to update parcel. Please try again.');
        }
      });
    }
  }

  deleteParcel(parcel: Parcel) {
    const confirmed = confirm(`Are you sure you want to delete parcel "${parcel.trackingNumber}"? This action cannot be undone.`);
    
    if (confirmed) {
      // Optimistically remove from UI
      this.parcels = this.parcels.filter(p => p.id !== parcel.id);
      
      // Make API call to delete parcel
      this.adminService.deleteParcel(parcel.id).subscribe({
        next: (response: any) => {
          console.log(`Successfully deleted parcel ${parcel.id}`);
          // You could show a success toast notification here
        },
        error: (error: any) => {
          console.error('Error deleting parcel:', error);
          // Revert the optimistic update on error
          this.parcels.push(parcel);
          // You could show an error toast notification here
          alert('Failed to delete parcel. Please try again.');
        }
      });
    }
  }
} 
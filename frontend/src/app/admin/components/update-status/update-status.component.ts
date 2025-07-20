import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-update-status',
  standalone: true,
  imports: [ReactiveFormsModule, TitleCasePipe],
  templateUrl: './update-status.component.html',
  styleUrls: ['./update-status.component.scss']
})
export class UpdateStatusComponent {
  @Input() currentStatus: string = '';
  @Output() statusUpdated = new EventEmitter<string>();
  @Output() cancelled = new EventEmitter<void>();

  statusForm: FormGroup;

  statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'picked-up', label: 'Picked Up' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'out-for-delivery', label: 'Out for Delivery' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  constructor(private fb: FormBuilder) {
    this.statusForm = this.fb.group({
      status: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.statusForm.patchValue({ status: this.currentStatus });
  }

  submit(): void {
    if (this.statusForm.valid) {
      this.statusUpdated.emit(this.statusForm.value.status);
    }
  }

  cancel(): void {
    this.cancelled.emit();
  }
}

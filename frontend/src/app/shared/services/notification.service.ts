import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface NotificationData {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'confirm';
  title: string;
  message: string;
  duration?: number; // Auto-dismiss after duration (ms), 0 = no auto-dismiss
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSubject = new BehaviorSubject<NotificationData[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  constructor() {}

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private addNotification(notification: Omit<NotificationData, 'id'>): string {
    const id = this.generateId();
    const newNotification: NotificationData = {
      id,
      ...notification
    };

    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next([...currentNotifications, newNotification]);

    // Auto-dismiss for non-confirmation notifications
    if (notification.type !== 'confirm' && notification.duration !== 0) {
      const duration = notification.duration || 5000; // Default 5 seconds
      setTimeout(() => {
        this.removeNotification(id);
      }, duration);
    }

    return id;
  }

  removeNotification(id: string): void {
    const currentNotifications = this.notificationsSubject.value;
    this.notificationsSubject.next(
      currentNotifications.filter(notification => notification.id !== id)
    );
  }

  // Success notification
  success(title: string, message: string, duration: number = 5000): string {
    return this.addNotification({
      type: 'success',
      title,
      message,
      duration
    });
  }

  // Error notification
  error(title: string, message: string, duration: number = 7000): string {
    return this.addNotification({
      type: 'error',
      title,
      message,
      duration
    });
  }

  // Warning notification
  warning(title: string, message: string, duration: number = 6000): string {
    return this.addNotification({
      type: 'warning',
      title,
      message,
      duration
    });
  }

  // Info notification
  info(title: string, message: string, duration: number = 5000): string {
    return this.addNotification({
      type: 'info',
      title,
      message,
      duration
    });
  }

  // Confirmation dialog
  confirm(
    title: string,
    message: string,
    confirmText: string = 'Confirm',
    cancelText: string = 'Cancel',
    onConfirm?: () => void,
    onCancel?: () => void
  ): string {
    const id = this.addNotification({
      type: 'confirm',
      title,
      message,
      duration: 0, // No auto-dismiss for confirmations
      confirmText,
      cancelText,
      onConfirm,
      onCancel
    });
    return id;
  }

  // Clear all notifications
  clearAll(): void {
    this.notificationsSubject.next([]);
  }
} 
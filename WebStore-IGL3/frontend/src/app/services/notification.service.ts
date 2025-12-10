import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);
  private idCounter = 0;

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  private addNotification(notification: Omit<Notification, 'id' | 'timestamp'>) {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${++this.idCounter}`,
      timestamp: new Date(),
      duration: notification.duration || 4000
    };

    console.log('🔔 NotificationService: Adding notification', newNotification);

    const currentNotifications = this.notifications$.value;
    console.log('🔔 Current notifications:', currentNotifications.length);
    
    this.notifications$.next([...currentNotifications, newNotification]);
    console.log('🔔 Notifications updated, new count:', this.notifications$.value.length);

    // Auto remove notification after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(newNotification.id);
      }, newNotification.duration);
    }

    return newNotification.id;
  }

  success(title: string, message?: string, duration?: number): string {
    return this.addNotification({ type: 'success', title, message, duration });
  }

  error(title: string, message?: string, duration?: number): string {
    return this.addNotification({ type: 'error', title, message, duration });
  }

  warning(title: string, message?: string, duration?: number): string {
    return this.addNotification({ type: 'warning', title, message, duration });
  }

  info(title: string, message?: string, duration?: number): string {
    return this.addNotification({ type: 'info', title, message, duration });
  }

  removeNotification(id: string) {
    const currentNotifications = this.notifications$.value;
    const filteredNotifications = currentNotifications.filter(n => n.id !== id);
    this.notifications$.next(filteredNotifications);
  }

  clear() {
    this.notifications$.next([]);
  }
}
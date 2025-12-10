import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { NotificationService, Notification } from '../../services/notification.service';
import { NotificationItemComponent } from '../notification-item/notification-item.component';

@Component({
  selector: 'app-notification-container',
  standalone: true,
  imports: [CommonModule, NotificationItemComponent],
  template: `
    <div class="notification-container">
      <app-notification-item
        *ngFor="let notification of notifications; trackBy: trackByFn"
        [notification]="notification"
        (close)="onNotificationClose($event)"
      ></app-notification-item>
    </div>
  `,
  styles: [`
    .notification-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      pointer-events: none;
      max-height: calc(100vh - 48px);
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .notification-container > * {
      pointer-events: auto;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .notification-container {
        left: 12px;
        right: 12px;
        bottom: 12px;
        align-items: stretch;
      }
    }

    @media (max-width: 480px) {
      .notification-container {
        left: 8px;
        right: 8px;
        bottom: 8px;
      }
    }
  `]
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    console.log('🔔 NotificationContainer: Initialized');
    this.notificationService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        console.log('🔔 NotificationContainer: Received notifications', notifications.length);
        this.notifications = notifications;
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onNotificationClose(id: string) {
    this.notificationService.removeNotification(id);
  }

  trackByFn(index: number, notification: Notification): string {
    return notification.id;
  }
}
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="notification-item" 
      [class]="'notification-' + notification.type"
    >
      <div class="notification-content">
        <div class="notification-icon">
          <svg *ngIf="notification.type === 'success'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <svg *ngIf="notification.type === 'error'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          <svg *ngIf="notification.type === 'warning'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
          </svg>
          <svg *ngIf="notification.type === 'info'" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
          </svg>
        </div>
        <div class="notification-text">
          <div class="notification-title" style="color: white !important;">{{ notification.title }}</div>
          <div class="notification-message" *ngIf="notification.message" style="color: white !important;">{{ notification.message }}</div>
        </div>
        <button 
          class="notification-close" 
          (click)="onClose()"
          aria-label="Close notification"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="notification-progress" *ngIf="notification.duration && notification.duration > 0">
        <div class="progress-bar" [style.animation-duration.ms]="notification.duration"></div>
      </div>
    </div>
  `,
  styles: [`
    .notification-item {
      background: linear-gradient(135deg, rgba(80, 40, 120, 0.95) 0%, rgba(50, 20, 80, 0.95) 100%);
      border-radius: 20px;
      box-shadow: 0px 4px 20px 0px rgba(0,0,0,0.3), 0px 4px 250px 0px rgba(146,54,255,0.25);
      margin-bottom: 12px;
      overflow: hidden;
      border: 1px solid rgba(146, 54, 255, 0.4);
      backdrop-filter: blur(16px);
      transform: translateX(100%);
      animation: slideInFromRight 0.3s ease-out forwards;
      position: relative;
      min-width: 320px;
      max-width: 400px;
    }

    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .notification-content {
      display: flex;
      align-items: flex-start;
      padding: 16px;
      gap: 12px;
    }

    .notification-icon {
      width: 24px;
      height: 24px;
      flex-shrink: 0;
      margin-top: 2px;
      color: white;
    }

    .notification-icon svg {
      width: 100%;
      height: 100%;
      fill: white;
    }

    .notification-text {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      font-weight: 600;
      font-size: 14px;
      line-height: 1.4;
      margin-bottom: 4px;
      color: white !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }

    .notification-message {
      font-size: 13px;
      line-height: 1.4;
      opacity: 0.9;
      color: white !important;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }

    .notification-close {
      background: none;
      border: none;
      width: 20px;
      height: 20px;
      cursor: pointer;
      opacity: 0.7;
      transition: opacity 0.2s ease;
      flex-shrink: 0;
      margin-top: 2px;
      color: white;
    }

    .notification-close:hover {
      opacity: 1;
    }

    .notification-close svg {
      width: 100%;
      height: 100%;
      fill: white;
    }

    .notification-progress {
      height: 3px;
      background: rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;
    }

    .progress-bar {
      height: 100%;
      width: 100%;
      background: currentColor;
      opacity: 0.3;
      transform: translateX(-100%);
      animation: progressBar linear forwards;
    }

    @keyframes progressBar {
      from {
        transform: translateX(-100%);
      }
      to {
        transform: translateX(0);
      }
    }

    /* Type-specific styling */
    .notification-success {
      border-left: 4px solid #10b981;
      color: white;
    }

    .notification-success .notification-title {
      color: white;
    }

    .notification-success .notification-message {
      color: rgba(255, 255, 255, 0.9);
    }

    .notification-error {
      border-left: 4px solid #ef4444;
      color: white;
    }

    .notification-error .notification-title {
      color: white;
    }

    .notification-error .notification-message {
      color: rgba(255, 255, 255, 0.9);
    }

    .notification-warning {
      border-left: 4px solid #f59e0b;
      color: white;
    }

    .notification-warning .notification-title {
      color: white;
    }

    .notification-warning .notification-message {
      color: rgba(255, 255, 255, 0.9);
    }

    .notification-info {
      border-left: 4px solid #3b82f6;
      color: white;
    }

    .notification-info .notification-title {
      color: white;
    }

    .notification-info .notification-message {
      color: rgba(255, 255, 255, 0.9);
    }

    /* Hover effects */
    .notification-item:hover {
      transform: translateX(-4px);
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
      transition: all 0.2s ease;
    }
  `],
  animations: []
})
export class NotificationItemComponent implements OnInit {
  @Input() notification!: Notification;
  @Output() close = new EventEmitter<string>();

  ngOnInit() {}

  onClose() {
    this.close.emit(this.notification.id);
  }
}
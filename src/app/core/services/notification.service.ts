import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notification$ = new Subject<Notification>();

  getNotifications() {
    return this.notification$.asObservable();
  }

  success(message: string, duration = 3000) {
    this.notification$.next({ message, type: 'success', duration });
  }

  error(message: string, duration = 5000) {
    this.notification$.next({ message, type: 'error', duration });
  }

  info(message: string, duration = 3000) {
    this.notification$.next({ message, type: 'info', duration });
  }
}

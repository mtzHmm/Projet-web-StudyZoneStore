import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DashboardEventService {
  // Subject pour notifier les changements dans les commandes
  private orderUpdatedSource = new Subject<void>();
  
  // Observable pour écouter les mises à jour
  orderUpdated$ = this.orderUpdatedSource.asObservable();

  constructor() {}

  // Méthode appelée quand une nouvelle commande est créée ou mise à jour
  notifyOrderUpdate() {
    console.log('📢 Notification: Order updated, refreshing dashboard...');
    this.orderUpdatedSource.next();
  }

  // Méthode appelée quand une commande est validée par l'admin
  notifyOrderValidated() {
    console.log('📢 Notification: Order validated, refreshing dashboard...');
    this.orderUpdatedSource.next();
  }

  // Méthode appelée quand une commande est livrée
  notifyOrderDelivered() {
    console.log('📢 Notification: Order delivered, refreshing dashboard...');
    this.orderUpdatedSource.next();
  }
}
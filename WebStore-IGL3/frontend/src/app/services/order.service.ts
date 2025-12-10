import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { Order, OrderResponse, OrderCreateRequest, OrderUpdateRequest, OrderStatus } from '../models/order.interface';
import { DashboardEventService } from './dashboard-event.service';
import { MOCK_ORDERS, LOCAL_STORAGE_KEYS as STORAGE_KEYS } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private orders: any[] = MOCK_ORDERS;
  private nextId: number = Math.max(...this.orders.map(o => o.id)) + 1;

  constructor(
    private dashboardEventService: DashboardEventService
  ) {
    console.log('📋 OrderService initialized with mock data');
    this.loadOrdersFromStorage();
  }

  // 📋 Récupérer toutes les commandes avec pagination
  getOrders(
    page: number = 0,
    size: number = 10,
    sortBy: string = 'orderDate',
    sortDirection: string = 'desc',
    status?: OrderStatus,
    userId?: number
  ): Observable<OrderResponse> {
    console.log('🔍 Mock getOrders:', { page, size, sortBy, sortDirection, status, userId });

    return of({
      orders: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0
    }).pipe(
      delay(300),
      tap(() => {
        // Filter orders
        let filtered = [...this.orders];

        if (status) {
          filtered = filtered.filter(o => o.status === status);
        }
        if (userId) {
          filtered = filtered.filter(o => o.userId === userId);
        }

        // Sort
        filtered.sort((a, b) => {
          const aVal = (a as any)[sortBy];
          const bVal = (b as any)[sortBy];
          const direction = sortDirection.toLowerCase() === 'desc' ? -1 : 1;

          if (aVal < bVal) return -1 * direction;
          if (aVal > bVal) return 1 * direction;
          return 0;
        });

        // Paginate
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);
        const start = page * size;
        const end = start + size;
        const paginatedOrders = filtered.slice(start, end);

        console.log('✅ Orders retrieved:', {
          count: paginatedOrders.length,
          total: totalElements,
          pages: totalPages
        });
      })
    );
  }

  // 🔎 Récupérer une commande par ID
  getOrderById(id: number): Observable<Order> {
    const order = this.orders.find(o => o.id === id);
    if (!order) {
      return throwError(() => new Error('Order not found'));
    }
    return of(order).pipe(delay(300));
  }

  // ➕ Créer une nouvelle commande
  createOrder(orderRequest: OrderCreateRequest): Observable<Order> {
    const newOrder: Order = {
      id: this.nextId++,
      orderDate: new Date().toISOString(),
      status: OrderStatus.PENDING,
      deliveryMethod: orderRequest.deliveryMethod,
      user: {
        id: 1,
        firstName: 'Mock',
        lastName: 'User',
        email: 'user@example.com'
      },
      orderItems: orderRequest.orderItems.map(item => ({
        id: Math.floor(Math.random() * 10000),
        quantity: item.quantity,
        product: {
          id: item.productId,
          name: 'Mock Product',
          price: item.price,
          imageUrl: '/assets/images/placeholder.jpg'
        }
      })),
      totalAmount: orderRequest.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    };

    this.orders.push(newOrder);
    this.saveOrdersToStorage();
    
    console.log('✅ Order created:', newOrder);
    this.dashboardEventService.notifyOrderUpdate();

    return of(newOrder).pipe(delay(500));
  }

  // ✏️ Mettre à jour une commande
  updateOrder(id: number, orderRequest: OrderUpdateRequest): Observable<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Order not found'));
    }

    const updatedOrder = { ...this.orders[index], ...orderRequest };
    this.orders[index] = updatedOrder;
    this.saveOrdersToStorage();

    console.log('✅ Order updated:', updatedOrder);
    this.dashboardEventService.notifyOrderUpdate();

    return of(updatedOrder).pipe(delay(500));
  }

  // ✅ Valider une commande (changer le statut en CONFIRMED)
  validateOrder(id: number): Observable<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Order not found'));
    }

    const updatedOrder = { ...this.orders[index], status: OrderStatus.CONFIRMED };
    this.orders[index] = updatedOrder;
    this.saveOrdersToStorage();

    console.log('✅ Order validated:', updatedOrder);
    this.dashboardEventService.notifyOrderValidated();

    return of(updatedOrder).pipe(delay(500));
  }

  // 📦 Marquer comme livrée
  markAsDelivered(id: number): Observable<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Order not found'));
    }

    const updatedOrder = {
      ...this.orders[index],
      status: OrderStatus.DELIVERED,
      deliveryDate: new Date()
    };
    this.orders[index] = updatedOrder;
    this.saveOrdersToStorage();

    console.log('✅ Order marked as delivered:', updatedOrder);
    this.dashboardEventService.notifyOrderDelivered();

    return of(updatedOrder).pipe(delay(500));
  }

  // 🔄 Alias pour confirmOrder (pour compatibilité)
  confirmOrder(id: number): Observable<Order> {
    return this.validateOrder(id);
  }

  // 🔄 Alias pour deliverOrder (pour compatibilité)
  deliverOrder(id: number): Observable<Order> {
    return this.markAsDelivered(id);
  }

  // ❌ Annuler une commande
  cancelOrder(id: number): Observable<Order> {
    const index = this.orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Order not found'));
    }

    const updatedOrder = { ...this.orders[index], status: OrderStatus.CANCELLED };
    this.orders[index] = updatedOrder;
    this.saveOrdersToStorage();

    console.log('✅ Order cancelled:', updatedOrder);
    this.dashboardEventService.notifyOrderUpdate();

    return of(updatedOrder).pipe(delay(500));
  }

  // 🗑️ Supprimer une commande
  deleteOrder(id: number): Observable<any> {
    const index = this.orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      return throwError(() => new Error('Order not found'));
    }

    this.orders.splice(index, 1);
    this.saveOrdersToStorage();

    console.log('✅ Order deleted, ID:', id);
    return of({ success: true }).pipe(delay(300));
  }

  // 📊 Statistiques des commandes
  getOrderStats(): Observable<any> {
    const stats = {
      totalOrders: this.orders.length,
      pendingOrders: this.orders.filter(o => o.status === OrderStatus.PENDING).length,
      confirmedOrders: this.orders.filter(o => o.status === OrderStatus.CONFIRMED).length,
      deliveredOrders: this.orders.filter(o => o.status === OrderStatus.DELIVERED).length,
      cancelledOrders: this.orders.filter(o => o.status === OrderStatus.CANCELLED).length,
      totalRevenue: this.orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    console.log('📊 Order stats:', stats);
    return of(stats).pipe(delay(300));
  }

  // 🔍 Rechercher des commandes
  searchOrders(keyword: string): Observable<Order[]> {
    const lowerKeyword = keyword.toLowerCase();
    const results = this.orders.filter(o =>
      o.reference.toLowerCase().includes(lowerKeyword) ||
      o.id.toString().includes(keyword)
    );

    return of(results).pipe(delay(300));
  }

  // 🎨 Utilitaires pour l'affichage
  getStatusLabel(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'En attente';
      case OrderStatus.CONFIRMED:
        return 'Confirmée';
      case OrderStatus.DELIVERED:
        return 'Livrée';
      case OrderStatus.CANCELLED:
        return 'Annulée';
      default:
        return status;
    }
  }

  getStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'text-yellow-400';
      case OrderStatus.CONFIRMED:
        return 'text-blue-400';
      case OrderStatus.DELIVERED:
        return 'text-green-400';
      case OrderStatus.CANCELLED:
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  }

  calculateOrderTotal(order: Order): number {
    return order.orderItems.reduce((total: number, item: any) => total + (item.product.price * item.quantity), 0);
  }

  // ==================== STORAGE METHODS ====================

  private getOrdersKey(): string {
    return STORAGE_KEYS.ORDERS;
  }

  private loadOrdersFromStorage(): void {
    try {
      const data = localStorage.getItem(this.getOrdersKey());
      if (data) {
        this.orders = JSON.parse(data);
        console.log('📦 Orders loaded from storage:', this.orders.length);
      }
    } catch (error) {
      console.error('Error loading orders from storage:', error);
    }
  }

  private saveOrdersToStorage(): void {
    try {
      localStorage.setItem(this.getOrdersKey(), JSON.stringify(this.orders));
      console.log('💾 Orders saved to storage');
    } catch (error) {
      console.error('Error saving orders to storage:', error);
    }
  }
}
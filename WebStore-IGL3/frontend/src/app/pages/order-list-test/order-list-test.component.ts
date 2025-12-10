import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.interface';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-order-list-test',
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-8 bg-gray-900 min-h-screen text-white">
      <h1 class="text-3xl font-bold mb-6">📋 Test - Gestion des Commandes</h1>
      
      <!-- Backend Status -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">📡 Status Backend</h2>
        <div class="p-4 rounded-lg" [class]="backendStatus.connected ? 'bg-green-900' : 'bg-red-900'">
          <p class="font-bold">{{backendStatus.connected ? '✅ Backend connecté' : '❌ Backend non accessible'}}</p>
          <p class="text-sm mt-2">{{backendStatus.message}}</p>
        </div>
      </div>

      <!-- Load Orders Test -->
      <div class="mb-8">
        <h2 class="text-xl font-semibold mb-4">📦 Test Chargement des Commandes</h2>
        <button (click)="loadOrders()" 
                class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors mr-4"
                [disabled]="isLoading">
          {{isLoading ? 'Chargement...' : 'Charger les Commandes'}}
        </button>
        
        <button (click)="loadOrderStats()" 
                class="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
                [disabled]="isLoading">
          Statistiques
        </button>
        
        <div *ngIf="loadResult" class="mt-4 p-4 rounded-lg" 
             [class]="loadResult.success ? 'bg-green-900' : 'bg-red-900'">
          <p class="font-bold">{{loadResult.success ? '✅ Commandes chargées' : '❌ Erreur chargement'}}</p>
          <p class="text-sm">{{loadResult.message}}</p>
        </div>
      </div>

      <!-- Orders List -->
      <div *ngIf="orders.length > 0" class="mb-8">
        <h2 class="text-xl font-semibold mb-4">📋 Commandes Trouvées ({{orders.length}})</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div *ngFor="let order of orders" 
               class="bg-white/10 border border-white/20 rounded-xl p-6">
            
            <!-- Order Header -->
            <div class="flex justify-between items-start mb-4">
              <div>
                <h3 class="text-lg font-bold text-violet-300">Commande #{{order.id}}</h3>
                <p class="text-sm text-gray-400">{{formatDate(order.orderDate)}}</p>
              </div>
              <span [class]="getStatusColor(order.status)" class="px-3 py-1 rounded-full text-sm font-medium">
                {{getStatusLabel(order.status)}}
              </span>
            </div>

            <!-- Customer Info -->
            <div class="mb-4">
              <h4 class="font-semibold text-white">Client:</h4>
              <p>{{order.user.firstName}} {{order.user.lastName}}</p>
              <p class="text-sm text-gray-400">{{order.user.email}}</p>
            </div>

            <!-- Order Items -->
            <div class="mb-4">
              <h4 class="font-semibold text-white">Articles ({{order.orderItems.length}}):</h4>
              <div *ngFor="let item of order.orderItems" class="text-sm text-gray-300 ml-2">
                • {{item.product.name}} × {{item.quantity}} - {{item.product.price}} DT
              </div>
            </div>

            <!-- Total & Delivery -->
            <div class="flex justify-between items-center pt-4 border-t border-white/20">
              <div>
                <p class="text-sm text-gray-400">{{order.deliveryMethod}}</p>
              </div>
              <div class="text-right">
                <p class="text-yellow-400 font-bold text-lg">{{calculateTotal(order)}} DT</p>
              </div>
            </div>

            <!-- Actions -->
            <div class="flex gap-2 mt-4">
              <button (click)="updateOrderStatus(order, OrderStatus.CONFIRMED)"
                      *ngIf="order.status === OrderStatus.PENDING"
                      class="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm">
                ✅ Confirmer
              </button>
              
              <button (click)="updateOrderStatus(order, OrderStatus.DELIVERED)"
                      *ngIf="order.status === OrderStatus.CONFIRMED"
                      class="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm">
                📦 Livrer
              </button>
              
              <button (click)="updateOrderStatus(order, OrderStatus.CANCELLED)"
                      *ngIf="order.status === OrderStatus.PENDING"
                      class="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm">
                ❌ Annuler
              </button>
              
              <button (click)="deleteOrder(order.id)"
                      class="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg text-sm">
                🗑️
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Stats Section -->
      <div *ngIf="stats" class="mb-8">
        <h2 class="text-xl font-semibold mb-4">📊 Statistiques</h2>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-blue-900 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold">{{stats.totalOrders}}</p>
            <p class="text-sm">Total</p>
          </div>
          <div class="bg-yellow-900 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold">{{stats.ordersByStatus?.PENDING || 0}}</p>
            <p class="text-sm">En attente</p>
          </div>
          <div class="bg-green-900 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold">{{stats.ordersByStatus?.DELIVERED || 0}}</p>
            <p class="text-sm">Livrées</p>
          </div>
          <div class="bg-purple-900 p-4 rounded-lg text-center">
            <p class="text-2xl font-bold">{{stats.ordersToday || 0}}</p>
            <p class="text-sm">Aujourd'hui</p>
          </div>
        </div>
      </div>

      <!-- Navigation -->
      <div class="flex gap-4">
        <button routerLink="/order-management"
                class="bg-violet-600 hover:bg-violet-700 px-6 py-3 rounded-lg transition-colors">
          📋 Interface de Gestion
        </button>
        
        <button routerLink="/test-connection"
                class="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg transition-colors">
          🔧 Test Connexion
        </button>
      </div>
    </div>
  `,
  standalone: true
})
export class OrderListTestComponent implements OnInit {
  backendStatus = { connected: false, message: 'Non testé' };
  orders: Order[] = [];
  stats: any = null;
  loadResult: any = null;
  isLoading = false;

  // Export enum for template
  OrderStatus = OrderStatus;

  constructor(
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.checkBackendConnection();
  }

  private checkBackendConnection() {
    this.orderService.getOrders(0, 1).subscribe({
      next: () => {
        this.backendStatus = { 
          connected: true, 
          message: 'API Orders accessible sur localhost:8080' 
        };
      },
      error: (error) => {
        this.backendStatus = { 
          connected: false, 
          message: `Erreur: ${this.getErrorMessage(error)}` 
        };
      }
    });
  }

  loadOrders() {
    this.isLoading = true;
    this.loadResult = null;
    
    this.orderService.getOrders(0, 50).subscribe({
      next: (response) => {
        this.orders = response.orders.map(order => ({
          ...order,
          totalAmount: this.orderService.calculateOrderTotal(order)
        }));
        this.loadResult = {
          success: true,
          message: `${response.orders.length} commande(s) trouvée(s)`
        };
        this.isLoading = false;
      },
      error: (error) => {
        this.loadResult = {
          success: false,
          message: this.getErrorMessage(error)
        };
        this.isLoading = false;
      }
    });
  }

  loadOrderStats() {
    this.orderService.getOrderStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        console.log('📊 Statistiques:', stats);
      },
      error: (error) => {
        console.error('❌ Erreur stats:', error);
      }
    });
  }

  updateOrderStatus(order: Order, newStatus: OrderStatus) {
    const statusLabels = {
      [OrderStatus.PENDING]: 'En attente',
      [OrderStatus.CONFIRMED]: 'Confirmée', 
      [OrderStatus.DELIVERED]: 'Livrée',
      [OrderStatus.CANCELLED]: 'Annulée'
    };

    if (confirm(`Changer le statut vers "${statusLabels[newStatus]}" ?`)) {
      this.orderService.updateOrder(order.id, { status: newStatus }).subscribe({
        next: (updatedOrder) => {
          const index = this.orders.findIndex(o => o.id === order.id);
          if (index !== -1) {
            this.orders[index] = { ...updatedOrder, totalAmount: this.orderService.calculateOrderTotal(updatedOrder) };
          }
        },
        error: (error) => {
          alert('Erreur: ' + this.getErrorMessage(error));
        }
      });
    }
  }

  deleteOrder(orderId: number) {
    this.orderService.deleteOrder(orderId).subscribe({
      next: () => {
        this.orders = this.orders.filter(o => o.id !== orderId);
        this.notificationService.success('Order Deleted', 'Order has been deleted successfully!');
      },
      error: (error) => {
        this.notificationService.error('Deletion Failed', 'Error: ' + this.getErrorMessage(error));
      }
    });
  }

  calculateTotal(order: Order): string {
    return this.orderService.calculateOrderTotal(order).toFixed(2);
  }

  getStatusLabel(status: OrderStatus): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: OrderStatus): string {
    const baseClasses = 'bg-opacity-20 border';
    switch (status) {
      case OrderStatus.PENDING:
        return baseClasses + ' bg-yellow-500 border-yellow-500 text-yellow-200';
      case OrderStatus.CONFIRMED:
        return baseClasses + ' bg-blue-500 border-blue-500 text-blue-200';
      case OrderStatus.DELIVERED:
        return baseClasses + ' bg-green-500 border-green-500 text-green-200';
      case OrderStatus.CANCELLED:
        return baseClasses + ' bg-red-500 border-red-500 text-red-200';
      default:
        return baseClasses + ' bg-gray-500 border-gray-500 text-gray-200';
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Backend non accessible - Vérifiez que Spring Boot est démarré sur localhost:8080';
    }
    if (error.error?.message) {
      return error.error.message;
    }
    return `Erreur HTTP ${error.status}: ${error.message}`;
  }
}
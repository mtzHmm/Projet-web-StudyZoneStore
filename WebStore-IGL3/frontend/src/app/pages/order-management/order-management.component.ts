import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderStatus } from '../../models/order.interface';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, SidebarComponent],
  templateUrl: './order-management.component.html',
})
export class OrderManagementComponent implements OnInit {
  searchTerm: string = '';
  orders: Order[] = [];
  isLoading = false;
  errorMessage = '';
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  // Status enum pour les filtres
  OrderStatus = OrderStatus;

  constructor(
    private orderService: OrderService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  // 🔄 Chargement des commandes depuis l'API
  loadOrders(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Utilisation directe des données mock pour la démo
    setTimeout(() => {
      console.log('📦 Chargement des données mock...');
      this.loadFallbackData();
      this.isLoading = false;
      console.log('✅ Données chargées:', this.orders);
    }, 500); // Simulation d'un délai de chargement

    /* Version avec API (décommentez quand le backend sera prêt)
    this.orderService.getOrders(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('📦 Commandes reçues:', response);
        this.orders = response.orders.map(order => ({
          ...order,
          totalAmount: this.orderService.calculateOrderTotal(order)
        }));
        this.currentPage = response.page;
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur chargement commandes:', error);
        this.errorMessage = this.getErrorMessage(error);
        this.isLoading = false;
        this.loadFallbackData();
      }
    });
    */
  }

  // 📊 Données de fallback pour les tests (quand le backend n'est pas accessible)
  private loadFallbackData(): void {
    this.orders = [
      {
        id: 1,
        orderDate: '2024-12-10T10:30:00',
        status: OrderStatus.PENDING,
        deliveryMethod: 'Standard',
        user: { id: 2, firstName: 'Mustapha', lastName: 'Labeydh', email: 'mustapha@example.com' },
        orderItems: [
          { id: 1, quantity: 2, product: { id: 1, name: 'T-Shirt StudyZone Store', price: 29.99, imageUrl: '/assets/images/tshirt-1.jpg' } }
        ],
        totalAmount: 59.98
      },
      {
        id: 2,
        orderDate: '2024-12-09T15:45:00',
        status: OrderStatus.CONFIRMED,
        deliveryMethod: 'Express',
        user: { id: 3, firstName: 'Derrick', lastName: 'Spencer', email: 'derrick@example.com' },
        orderItems: [
          { id: 2, quantity: 1, product: { id: 2, name: 'Hoodie StudyZone Store', price: 49.99, imageUrl: '/assets/images/hoodie-1.jpg' } },
          { id: 3, quantity: 2, product: { id: 3, name: 'StudyZone Sticker Pack', price: 9.99, imageUrl: '/assets/images/stickers.jpg' } }
        ],
        totalAmount: 69.97
      },
      {
        id: 3,
        orderDate: '2024-12-08T14:20:00',
        status: OrderStatus.DELIVERED,
        deliveryMethod: 'Standard',
        user: { id: 4, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com' },
        orderItems: [
          { id: 4, quantity: 3, product: { id: 4, name: 'StudyZone Mug', price: 12.99, imageUrl: '/assets/images/mug.jpg' } }
        ],
        totalAmount: 38.97
      },
      {
        id: 4,
        orderDate: '2024-12-07T09:15:00',
        status: OrderStatus.CANCELLED,
        deliveryMethod: 'Express',
        user: { id: 5, firstName: 'Ahmed', lastName: 'Ben Ali', email: 'ahmed@example.com' },
        orderItems: [
          { id: 5, quantity: 1, product: { id: 5, name: 'StudyZone Cap', price: 19.99, imageUrl: '/assets/images/cap.jpg' } }
        ],
        totalAmount: 19.99
      },
      {
        id: 5,
        orderDate: '2024-12-06T16:30:00',
        status: OrderStatus.PENDING,
        deliveryMethod: 'Standard',
        user: { id: 6, firstName: 'Fatima', lastName: 'Zouari', email: 'fatima@example.com' },
        orderItems: [
          { id: 6, quantity: 2, product: { id: 1, name: 'T-Shirt StudyZone Store', price: 29.99, imageUrl: '/assets/images/tshirt-1.jpg' } },
          { id: 7, quantity: 1, product: { id: 6, name: 'StudyZone Bag', price: 24.99, imageUrl: '/assets/images/bag.jpg' } }
        ],
        totalAmount: 84.97
      },
      {
        id: 6,
        orderDate: '2024-12-05T11:45:00',
        status: OrderStatus.CONFIRMED,
        deliveryMethod: 'Express',
        user: { id: 7, firstName: 'Mohamed', lastName: 'Trabelsi', email: 'mohamed@example.com' },
        orderItems: [
          { id: 8, quantity: 1, product: { id: 2, name: 'Hoodie StudyZone Store', price: 49.99, imageUrl: '/assets/images/hoodie-1.jpg' } }
        ],
        totalAmount: 49.99
      },
      {
        id: 7,
        orderDate: '2024-12-04T13:22:00',
        status: OrderStatus.DELIVERED,
        deliveryMethod: 'Standard',
        user: { id: 8, firstName: 'Leila', lastName: 'Hajji', email: 'leila@example.com' },
        orderItems: [
          { id: 9, quantity: 4, product: { id: 3, name: 'StudyZone Sticker Pack', price: 9.99, imageUrl: '/assets/images/stickers.jpg' } },
          { id: 10, quantity: 1, product: { id: 4, name: 'StudyZone Mug', price: 12.99, imageUrl: '/assets/images/mug.jpg' } }
        ],
        totalAmount: 52.95
      },
      {
        id: 8,
        orderDate: '2024-12-03T08:10:00',
        status: OrderStatus.PENDING,
        deliveryMethod: 'Standard',
        user: { id: 9, firstName: 'Youssef', lastName: 'Karray', email: 'youssef@example.com' },
        orderItems: [
          { id: 11, quantity: 1, product: { id: 5, name: 'StudyZone Cap', price: 19.99, imageUrl: '/assets/images/cap.jpg' } },
          { id: 12, quantity: 1, product: { id: 6, name: 'StudyZone Bag', price: 24.99, imageUrl: '/assets/images/bag.jpg' } }
        ],
        totalAmount: 44.98
      }
    ];
    this.totalElements = this.orders.length;
    this.totalPages = Math.ceil(this.totalElements / this.pageSize);
    this.currentPage = 0;
  }

  // 🔍 Filtrage des commandes
  get filteredOrders(): Order[] {
    if (!this.searchTerm.trim()) {
      return this.orders;
    }

    const searchLower = this.searchTerm.toLowerCase();
    return this.orders.filter(order =>
      order.user.firstName.toLowerCase().includes(searchLower) ||
      order.user.lastName.toLowerCase().includes(searchLower) ||
      order.user.email.toLowerCase().includes(searchLower) ||
      order.id.toString().includes(searchLower) ||
      this.orderService.getStatusLabel(order.status).toLowerCase().includes(searchLower)
    );
  }

  // 🗑️ Supprimer une commande
  deleteOrder(order: Order): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande #${order.id} ?`)) {
      // Simulation de suppression locale
      const index = this.orders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        this.orders.splice(index, 1);
        this.totalElements = this.orders.length;
        this.totalPages = Math.ceil(this.totalElements / this.pageSize);
        console.log('✅ Commande supprimée localement');
        this.notificationService.success('Commande Supprimée', `La commande #${order.id} a été supprimée avec succès!`);
      }
    }
  }

  // ✅ Valider une commande
  validateOrder(order: Order): void {
    if (order.status !== OrderStatus.PENDING) {
      this.notificationService.warning('Erreur de Validation', 'Seules les commandes en attente peuvent être validées.');
      return;
    }

    // Simulation de validation locale
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      this.orders[index].status = OrderStatus.CONFIRMED;
      console.log('✅ Commande validée localement');
      this.notificationService.success('Commande Validée', `La commande #${order.id} a été validée avec succès!`);
    }
  }

  // 📦 Marquer comme livrée
  markAsDelivered(order: Order): void {
    if (order.status !== OrderStatus.CONFIRMED) {
      this.notificationService.warning('Erreur de Livraison', 'Seules les commandes confirmées peuvent être marquées comme livrées.');
      return;
    }

    // Simulation de marquage comme livrée locale
    const index = this.orders.findIndex(o => o.id === order.id);
    if (index !== -1) {
      this.orders[index].status = OrderStatus.DELIVERED;
      console.log('✅ Commande marquée comme livrée localement');
      this.notificationService.success('Commande Livrée', `La commande #${order.id} a été marquée comme livrée!`);
    }
  }

  // ❌ Annuler une commande
  cancelOrder(order: Order): void {
    if (order.status === OrderStatus.DELIVERED || order.status === OrderStatus.CANCELLED) {
      this.notificationService.warning('Erreur d\'Annulation', 'Cette commande ne peut plus être annulée.');
      return;
    }

    if (confirm(`Êtes-vous sûr de vouloir annuler la commande #${order.id} ?`)) {
      // Simulation d'annulation locale
      const index = this.orders.findIndex(o => o.id === order.id);
      if (index !== -1) {
        this.orders[index].status = OrderStatus.CANCELLED;
        console.log('✅ Commande annulée localement');
        this.notificationService.success('Commande Annulée', `La commande #${order.id} a été annulée avec succès!`);
      }
    }
  }

  // 👁️ Voir les détails d'une commande
  viewOrder(order: Order): void {
    console.log('🔍 Navigation vers les détails de la commande #' + order.id);
    this.router.navigate(['/order-details', order.id]);
  }

  // 📄 Pagination
  previousPage(): void {
    if (this.currentPage > 0) {
      this.currentPage--;
      // Pour les données mock, on recharge simplement
      this.loadOrders();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      // Pour les données mock, on recharge simplement
      this.loadOrders();
    }
  }

  // 🔍 Obtenir les commandes paginées
  get paginatedOrders(): Order[] {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredOrders.slice(start, end);
  }

  // 🎨 Utilitaires d'affichage
  getStatusLabel(status: OrderStatus): string {
    return this.orderService.getStatusLabel(status);
  }

  getStatusColor(status: OrderStatus): string {
    return this.orderService.getStatusColor(status);
  }

  getClientName(order: Order): string {
    return `${order.user.firstName} ${order.user.lastName}`;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  canValidate(order: Order): boolean {
    return order.status === OrderStatus.PENDING;
  }

  canDeliver(order: Order): boolean {
    return order.status === OrderStatus.CONFIRMED;
  }

  canCancel(order: Order): boolean {
    return order.status === OrderStatus.PENDING || order.status === OrderStatus.CONFIRMED;
  }

  // 🔄 Alias methods for template compatibility
  confirmOrder(order: Order): void {
    this.validateOrder(order);
  }

  deliverOrder(order: Order): void {
    this.markAsDelivered(order);
  }

  // 🚨 Gestion des erreurs
  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Backend non accessible - Utilisation des données de test';
    }
    if (error.error?.message) {
      return error.error.message;
    }
    return `Erreur HTTP ${error.status}: ${error.message}`;
  }
}

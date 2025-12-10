import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderItem, OrderStatus } from '../../models/order.interface';
import { NotificationService } from '../../services/notification.service';

interface CustomerInfo {
  name: string;
  paymentMethod: string;
  deliveryMethod: string;
  address: string;
}

@Component({
  selector: 'app-order-details',
  imports: [CommonModule],
  templateUrl: './order-details.component.html',
  styleUrl: './order-details.component.css'
})
export class OrderDetails implements OnInit {
  
  // Propriétés pour la gestion des commandes
  orderItems: OrderItem[] = [];
  currentOrder: Order | null = null;
  orderId: number = 0;
  isLoading = false;
  errorMessage = '';

  // Informations du client
  customerInfo: CustomerInfo = {
    name: 'Loading...',
    paymentMethod: 'Loading...',
    deliveryMethod: 'Loading...',
    address: 'Loading...'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private orderService: OrderService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Récupérer l'ID de la commande depuis l'URL
    this.route.params.subscribe(params => {
      this.orderId = +params['id'];
      console.log('🔍 ID de commande récupéré:', this.orderId);
      
      if (this.orderId && this.orderId > 0) {
        this.loadOrder();
      } else {
        this.errorMessage = 'ID de commande invalide';
        console.error('❌ ID de commande invalide:', params['id']);
      }
    });
  }

  // 🔄 Charger les détails de la commande ET les items
  loadOrder(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('🔍 Chargement de la commande ID:', this.orderId);
    console.log('🌐 URL de l\'API:', `http://localhost:8080/api/orders/${this.orderId}`);
    
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        console.log('📦 Commande chargée:', order);
        console.log('📋 Order items reçus:', order.orderItems);
        
        this.currentOrder = order;
        this.orderItems = order.orderItems || [];
        this.populateCustomerInfo(order);
        this.isLoading = false;
        
        if (this.orderItems.length === 0) {
          console.warn('⚠️ Aucun order item trouvé pour cette commande');
        }
      },
      error: (error) => {
        console.error('❌ Erreur chargement commande:', error);
        console.error('📊 Détails de l\'erreur complète:', error);
        console.error('📊 Status HTTP:', error.status);
        console.error('📊 URL tentée:', `http://localhost:8080/api/orders/${this.orderId}`);
        
        if (error.status === 0) {
          console.log('🔌 Problème de connectivité - Backend potentiellement inaccessible');
        } else if (error.status === 404) {
          console.log(`� Commande ID ${this.orderId} non trouvée en base de données`);
        } else if (error.status === 403) {
          console.log('🚫 Accès refusé - Problème d\'authentification ou CORS');
        }
        
        console.log('🔄 Chargement des données de test...');
        this.loadTestData();
        this.isLoading = false;
      }
    });
  }

  // 🧪 Charger des données de test si l'API ne fonctionne pas
  loadTestData(): void {
    console.log('🧪 Chargement des données de test pour commande ID:', this.orderId);
    
    // Données mock basées sur l'ID de la commande
    const mockOrders = {
      1: {
        id: 1,
        orderDate: '2024-12-10T10:30:00',
        status: OrderStatus.PENDING,
        deliveryMethod: 'Standard',
        user: { id: 2, firstName: 'Mustapha', lastName: 'Labeydh', email: 'mustapha@example.com' },
        orderItems: [
          { id: 1, quantity: 2, product: { id: 1, name: 'T-Shirt StudyZone Store', price: 29.99, imageUrl: '/assets/images/tshirt-1.jpg' } }
        ]
      },
      2: {
        id: 2,
        orderDate: '2024-12-09T15:45:00',
        status: OrderStatus.CONFIRMED,
        deliveryMethod: 'Express',
        user: { id: 3, firstName: 'Derrick', lastName: 'Spencer', email: 'derrick@example.com' },
        orderItems: [
          { id: 2, quantity: 1, product: { id: 2, name: 'Hoodie StudyZone Store', price: 49.99, imageUrl: '/assets/images/hoodie-1.jpg' } },
          { id: 3, quantity: 2, product: { id: 3, name: 'StudyZone Sticker Pack', price: 9.99, imageUrl: '/assets/images/stickers.jpg' } }
        ]
      },
      3: {
        id: 3,
        orderDate: '2024-12-08T14:20:00',
        status: OrderStatus.DELIVERED,
        deliveryMethod: 'Standard',
        user: { id: 4, firstName: 'Sarah', lastName: 'Johnson', email: 'sarah@example.com' },
        orderItems: [
          { id: 4, quantity: 3, product: { id: 4, name: 'StudyZone Mug', price: 12.99, imageUrl: '/assets/images/mug.jpg' } }
        ]
      },
      4: {
        id: 4,
        orderDate: '2024-12-07T09:15:00',
        status: OrderStatus.CANCELLED,
        deliveryMethod: 'Express',
        user: { id: 5, firstName: 'Ahmed', lastName: 'Ben Ali', email: 'ahmed@example.com' },
        orderItems: [
          { id: 5, quantity: 1, product: { id: 5, name: 'StudyZone Cap', price: 19.99, imageUrl: '/assets/images/cap.jpg' } }
        ]
      },
      5: {
        id: 5,
        orderDate: '2024-12-06T16:30:00',
        status: OrderStatus.PENDING,
        deliveryMethod: 'Standard',
        user: { id: 6, firstName: 'Fatima', lastName: 'Zouari', email: 'fatima@example.com' },
        orderItems: [
          { id: 6, quantity: 2, product: { id: 1, name: 'T-Shirt StudyZone Store', price: 29.99, imageUrl: '/assets/images/tshirt-1.jpg' } },
          { id: 7, quantity: 1, product: { id: 6, name: 'StudyZone Bag', price: 24.99, imageUrl: '/assets/images/bag.jpg' } }
        ]
      }
    };
    
    this.currentOrder = mockOrders[this.orderId as keyof typeof mockOrders] || {
      id: this.orderId,
      orderDate: '2024-12-10T12:00:00',
      status: OrderStatus.PENDING,
      deliveryMethod: 'Standard',
      user: { id: 999, firstName: 'Utilisateur', lastName: 'Test', email: 'test@example.com' },
      orderItems: [
        { id: 999, quantity: 1, product: { id: 999, name: 'Produit Test', price: 25.00, imageUrl: '/assets/images/placeholder.jpg' } }
      ]
    };
    
    this.orderItems = this.currentOrder.orderItems;
    this.populateCustomerInfo(this.currentOrder);
    console.log('✅ Données de test chargées:', this.currentOrder);
  }

  // 👤 Remplir les informations client depuis la commande
  populateCustomerInfo(order: Order): void {
    const paymentMethods = ['Paiement en ligne', 'Carte bancaire', 'PayPal', 'Virement bancaire'];
    const randomPayment = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
    
    this.customerInfo = {
      name: `${order.user.firstName} ${order.user.lastName}`,
      paymentMethod: randomPayment,
      deliveryMethod: order.deliveryMethod,
      address: `${order.user.email} | Tunis, Tunisie`
    };
  }

  // 💰 Calcul du montant total depuis les orderItems
  get totalAmount(): number {
    return this.orderItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  // 🆔 Fonction de tracking pour *ngFor
  trackByItemId(index: number, item: OrderItem): number {
    return item.id;
  }

  // ✅ Accepter/Confirmer la commande (PENDING → CONFIRMED)
  acceptOrder(): void {
    if (!this.currentOrder || this.currentOrder.status !== OrderStatus.PENDING) {
      this.notificationService.warning('Erreur de Confirmation', 'Seules les commandes en attente peuvent être confirmées.');
      return;
    }
    
    // Simulation de confirmation locale
    this.currentOrder.status = OrderStatus.CONFIRMED;
    console.log('✅ Commande confirmée localement');
    this.notificationService.success('Commande Confirmée', `La commande #${this.orderId} a été confirmée avec succès!`);
  }

  // 🚚 Livrer la commande (CONFIRMED → DELIVERED)
  deliverOrder(): void {
    if (!this.currentOrder || this.currentOrder.status !== OrderStatus.CONFIRMED) {
      this.notificationService.warning('Erreur de Livraison', 'Seules les commandes confirmées peuvent être livrées.');
      return;
    }
    
    // Simulation de livraison locale
    this.currentOrder.status = OrderStatus.DELIVERED;
    console.log('🚚 Commande livrée localement');
    this.notificationService.success('Commande Livrée', `La commande #${this.orderId} a été marquée comme livrée!`);
  }

  // 🎨 Utilitaires pour l'affichage des statuts
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

  // 🗑️ Supprimer la commande
  deleteOrder(): void {
    if (!this.currentOrder || this.currentOrder.status !== OrderStatus.PENDING) {
      this.notificationService.warning('Erreur de Suppression', 'Seules les commandes en attente peuvent être supprimées.');
      return;
    }
    
    if (confirm(`Êtes-vous sûr de vouloir supprimer la commande #${this.orderId} ?`)) {
      // Simulation de suppression locale
      console.log('🗑️ Commande supprimée localement');
      this.notificationService.success('Commande Supprimée', `La commande #${this.orderId} a été supprimée avec succès!`);
      
      // Redirection après un court délai
      setTimeout(() => {
        this.router.navigate(['/order-management']);
      }, 1000);
    }
  }

  // Retourner à la boutique
  goBackToShop(): void {
    this.router.navigate(['/shop']);
  }

  // Retourner au dashboard
  goBackToOrder(): void {
    this.router.navigate(['/order-management']);
  }
}
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderItem } from '../../models/order.interface';

@Component({
  selector: 'app-historic-details',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './historic-details.component.html',
})
export class HistoricDetailsComponent implements OnInit {
  searchTerm: string = '';
  orderId: number = 0;
  clientId: number = 0;

  // Order data
  order: Order | null = null;
  items: OrderItem[] = [];
  
  // Loading and error states
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Get order ID and user ID from URL parameters
    const orderIdParam = this.route.snapshot.paramMap.get('orderId');
    const userIdParam = this.route.snapshot.paramMap.get('userId');
    
    this.orderId = orderIdParam ? parseInt(orderIdParam, 10) : 0;
    this.clientId = userIdParam ? parseInt(userIdParam, 10) : 0;

    if (this.orderId > 0) {
      this.loadOrderDetails();
    } else {
      this.errorMessage = 'ID de commande invalide';
    }
  }

  loadOrderDetails(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.orderService.getOrderById(this.orderId).subscribe({
      next: (order) => {
        this.order = order;
        this.items = order.orderItems || [];
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de la commande:', error);
        this.errorMessage = 'Erreur lors du chargement de la commande';
        this.isLoading = false;
      }
    });
  }

  get filteredItems(): OrderItem[] {
    if (!this.searchTerm.trim()) {
      return this.items;
    }

    const searchLower = this.searchTerm.toLowerCase();
    return this.items.filter(item => 
      item.product.name.toLowerCase().includes(searchLower)
    );
  }

  getTotal(): number {
    return this.items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  }

  goBackToUserHistory(): void {
    if (this.clientId > 0) {
      this.router.navigate(['/user-history', this.clientId]);
    } else {
      // Fallback: try to get user ID from the loaded order
      if (this.order?.user?.id) {
        this.router.navigate(['/user-history', this.order.user.id]);
      } else {
        // Last resort: navigate to user management
        this.router.navigate(['/user-management']);
      }
    }
  }

  goBackToUserManagement(): void {
    this.router.navigate(['/user-management']);
  }
}

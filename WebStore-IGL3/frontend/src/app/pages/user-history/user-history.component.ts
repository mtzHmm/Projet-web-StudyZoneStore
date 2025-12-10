import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { Order, OrderResponse } from '../../models/order.interface';

@Component({
  selector: 'app-user-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './user-history.component.html',
})
export class UserHistoryComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('historyContainer', { static: false }) historyContainer!: ElementRef;

  // Pagination properties
  currentPage = 0; // Backend uses 0-based indexing
  pageSize = 10;
  isLoading = false;
  hasMoreData = true;
  totalOrders = 0;
  totalPages = 0;

  // Currently displayed orders
  orders: Order[] = [];
  
  // Filtered orders for display
  filteredOrders: Order[] = [];

  searchTerm: string = '';
  clientName: string = '';
  clientId: number = 0;
  
  // Error handling
  errorMessage: string = '';
  
  private searchTimeout: any;
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private orderService: OrderService
  ) {}

  ngOnInit(): void {
    // Get user ID from URL - try both 'id' and 'userId' parameters
    const idParam = this.route.snapshot.paramMap.get('id') || this.route.snapshot.paramMap.get('userId');
    this.clientId = idParam ? parseInt(idParam, 10) : 0;

    // Get client name from navigation state
    const state = this.router.getCurrentNavigation()?.extras.state as { clientName?: string };

    if (state?.clientName) {
      this.clientName = state.clientName;
      localStorage.setItem('selectedClientName', this.clientName);
    } else {
      // Fallback: read from localStorage if page was refreshed
      this.clientName = localStorage.getItem('selectedClientName') ?? 'Utilisateur inconnu';
    }

    // Load user orders from API
    if (this.clientId > 0) {
      this.loadUserOrders();
    } else {
      this.errorMessage = 'ID utilisateur invalide';
    }
  }

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  ngOnDestroy() {
    if (this.historyContainer?.nativeElement) {
      this.historyContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  // Load user orders from API
  private loadUserOrders() {
    if (this.isLoading) return;
    
    this.isLoading = true;
    this.errorMessage = '';
    
    console.log('🔄 Loading orders for user ID:', this.clientId, 'Page:', this.currentPage);
    
    this.orderService.getOrders(
      this.currentPage,
      this.pageSize,
      'orderDate',
      'desc',
      undefined, // status filter
      this.clientId // userId filter
    ).subscribe({
      next: (response: OrderResponse) => {
        console.log('✅ Orders loaded successfully:', response);
        
        // Add new orders to existing ones (for infinite scroll)
        this.orders = [...this.orders, ...response.orders];
        this.totalOrders = response.totalElements;
        this.totalPages = response.totalPages;
        
        // Update pagination state
        this.hasMoreData = this.currentPage < response.totalPages - 1;
        this.isLoading = false;
        
        // Update filtered orders
        this.updateFilteredOrders();
        
        console.log(`📊 Loaded ${response.orders.length} orders. Total: ${this.orders.length}/${this.totalOrders}`);
      },
      error: (error) => {
        console.error('❌ Error loading orders:', error);
        this.errorMessage = `Erreur lors du chargement des commandes: ${error.error?.message || error.message || 'Erreur inconnue'}`;
        this.isLoading = false;
      }
    });
  }

  // Setup infinite scroll
  private setupInfiniteScroll() {
    if (this.historyContainer?.nativeElement) {
      this.historyContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  // Handle scroll event
  private onScroll() {
    const element = this.historyContainer.nativeElement;
    const threshold = 100; // Load more when 100px from bottom
    
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - threshold) {
      if (!this.isLoading && this.hasMoreData) {
        this.loadMoreOrders();
      }
    }
  }

  // Load more orders (for infinite scroll)
  private loadMoreOrders() {
    if (this.isLoading || !this.hasMoreData) return;

    this.currentPage++;
    this.loadUserOrders();
  }

  // Update filtered orders
  private updateFilteredOrders() {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = [...this.orders];
    } else {
      this.filteredOrders = this.orders.filter(order => {
        const searchLower = this.searchTerm.toLowerCase();
        const totalAmount = this.calculateOrderTotal(order);
        const orderDate = new Date(order.orderDate).toLocaleDateString('fr-FR');
        
        return (
          order.id.toString().includes(searchLower) ||
          orderDate.toLowerCase().includes(searchLower) ||
          totalAmount.toString().includes(searchLower) ||
          order.status.toLowerCase().includes(searchLower)
        );
      });
    }
  }

  // Calculate total amount for an order
  calculateOrderTotal(order: Order): number {
    if (order.totalAmount) {
      return order.totalAmount;
    }
    
    return order.orderItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  }

  // Search functionality with debouncing
  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.updateFilteredOrders();
    }, 300);
  }

  // Reset pagination for new search
  private resetPagination() {
    this.currentPage = 0; // Backend uses 0-based indexing
    this.orders = [];
    this.filteredOrders = [];
    this.hasMoreData = true;
    this.isLoading = false;
  }

  // Aller vers la page des détails
  goToDetails(order: Order) {
    this.router.navigate(['/historic-details', order.id, this.clientId]);
  }
}

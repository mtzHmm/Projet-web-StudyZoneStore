import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CartItem } from '../../models/cart-item.interface';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';
import { MOCK_PRODUCTS } from '../../services/mock-data';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalAmount: number = 0;
  loading: boolean = false;
  error: string = '';

  constructor(
    private router: Router,
    private http: HttpClient,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    // Clear existing cart data and load fresh mock data
    this.clearAndReloadCart();
  }

  clearAndReloadCart() {
    // Clear localStorage cart for guest user (userId = 0)
    localStorage.removeItem('studyzone_cart_0');
    console.log('🧹 Cleared existing cart data');
    
    // Load fresh cart items
    this.loadCartItems();
  }

  loadCartItems() {
    console.log('🛒 Loading cart - no auth required');
    
    this.loading = true;
    this.error = '';
    
    // Use guest user ID (0) for cart operations
    this.cartService.getCartItems(0).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
        this.loading = false;
        console.log('✅ Cart items loaded:', items);
      },
      error: (error) => {
        console.error('❌ Error loading cart items:', error);
        this.error = 'Failed to load cart items';
        this.loading = false;
        // Fallback to demo data
        this.loadDemoCartData();
      }
    });
  }

  loadDemoCartData() {
    // Get some products from mock data for demo cart
    const product1 = MOCK_PRODUCTS.find(p => p.id === 1); // Black T-Shirt
    const product2 = MOCK_PRODUCTS.find(p => p.id === 3); // Navy Hoodie
    const product3 = MOCK_PRODUCTS.find(p => p.id === 5); // Blue Jeans
    
    this.cartItems = [];
    
    if (product1) {
      this.cartItems.push({
        id: 1,
        productId: product1.id,
        name: product1.name,
        price: product1.price,
        quantity: 2,
        totalPrice: product1.price * 2,
        imageUrl: product1.imageUrl || '/assets/images/placeholder.jpg'
      });
    }
    
    if (product2) {
      this.cartItems.push({
        id: 2,
        productId: product2.id,
        name: product2.name,
        price: product2.price,
        quantity: 1,
        totalPrice: product2.price * 1,
        imageUrl: product2.imageUrl || '/assets/images/placeholder.jpg'
      });
    }
    
    if (product3) {
      this.cartItems.push({
        id: 3,
        productId: product3.id,
        name: product3.name,
        price: product3.price,
        quantity: 1,
        totalPrice: product3.price * 1,
        imageUrl: product3.imageUrl || '/assets/images/placeholder.jpg'
      });
    }
    
    this.calculateTotal();
    this.loading = false;
    this.error = '';
    console.log('Demo cart loaded with mock products:', this.cartItems);
  }

  onQuantityChange(event: { id: number, quantity: number }) {
    const item = this.cartItems.find(item => item.id === event.id);
    if (item) {
      item.quantity = event.quantity;
      item.totalPrice = item.price * item.quantity;
      this.calculateTotal();
    }
  }

  increaseQuantity(id: number) {
    const item = this.cartItems.find(item => item.id === id);
    if (item) {
      const newQuantity = item.quantity + 1;
      this.updateItemQuantity(item, newQuantity);
    }
  }

  decreaseQuantity(id: number) {
    const item = this.cartItems.find(item => item.id === id);
    if (item && item.quantity > 1) {
      const newQuantity = item.quantity - 1;
      this.updateItemQuantity(item, newQuantity);
    }
  }

  private updateItemQuantity(item: CartItem, newQuantity: number) {
    // Calculer la différence de quantité
    const oldQuantity = item.quantity;
    const quantityDiff = newQuantity - oldQuantity;
    
    if (quantityDiff === 0) {
      return; // Pas de changement
    }

    // Mise à jour optimiste (UI d'abord)
    item.quantity = newQuantity;
    item.totalPrice = item.price * item.quantity;
    this.calculateTotal();

    console.log('🔄 Quantity updated for product:', item.productId);
    this.notificationService.success('Quantity updated!');
  }

  onRemoveItem(id: number) {
    // Trouver l'élément à supprimer pour récupérer le productId
    const itemToRemove = this.cartItems.find(item => item.id === id);
    if (!itemToRemove) {
      console.error('Item not found in cart');
      return;
    }

    console.log('🗑️ Removing item:', itemToRemove);
    
    // Supprimer localement
    this.cartItems = this.cartItems.filter(item => item.id !== id);
    this.calculateTotal();
    this.notificationService.success('Item removed from cart!');
  }

  calculateTotal() {
    this.totalAmount = this.cartItems.reduce((total, item) => total + item.totalPrice, 0);
  }

  goBackToShop() {
    // Navigation vers la page shop
    this.router.navigate(['/shop']);
  }

  checkout() {
    if (this.cartItems.length === 0) {
      this.notificationService.warning('Your cart is empty!');
      return;
    }

    // Allow checkout for all users - no auth required
    console.log('🛒 Redirecting to checkout page...');
    this.router.navigate(['/checkout']);
  }

  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }

  handleImageError(event: any) {
    if (event.target) {
      event.target.src = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=82&h=82&fit=crop&crop=center';
    }
  }
}

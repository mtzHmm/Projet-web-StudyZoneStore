import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CartItem } from '../../models/cart-item.interface';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, RouterModule],
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
    private authService: AuthService,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.loadCartItems();
  }

  loadCartItems() {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.error = 'Veuillez vous connecter pour voir votre panier';
      this.cartItems = [];
      this.calculateTotal();
      return;
    }

    this.loading = true;
    this.error = '';
    
    this.cartService.getCartItems(currentUser.id).subscribe({
      next: (items) => {
        this.cartItems = items;
        this.calculateTotal();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du panier:', error);
        this.error = 'Impossible de charger le panier';
        this.loading = false;
        
        // Fallback vers des données de test si l'API ne marche pas
        this.cartItems = [];
        this.calculateTotal();
      }
    });
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
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.router.navigate(['/sign-in'], {
        queryParams: { 
          returnUrl: '/cart',
          message: 'Please sign in to modify your cart',
          messageType: 'warning'
        }
      });
      return;
    }

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

    console.log('🔄 Updating quantity for product:', item.productId, 'from:', oldQuantity, 'to:', newQuantity);

    // Utiliser addToCart avec la différence de quantité (peut être négative)
    this.cartService.addToCart(currentUser.id, item.productId, quantityDiff).subscribe({
      next: (response) => {
        console.log('✅ Quantity updated successfully via addToCart:', response);
        // Pas besoin de recharger, la mise à jour optimiste est déjà faite
        // L'UI est déjà à jour grâce à la mise à jour optimiste ci-dessus
      },
      error: (error) => {
        console.error('❌ Error updating quantity:', error);
        // Rollback en cas d'erreur
        item.quantity = oldQuantity;
        item.totalPrice = item.price * item.quantity;
        this.calculateTotal();
        this.notificationService.error('Error updating quantity. Please try again.');
      }
    });
  }

  onRemoveItem(id: number) {
    const currentUser = this.authService.getCurrentUser();
    
    if (!currentUser || !currentUser.id) {
      this.notificationService.warning('Please login to modify your cart');
      return;
    }

    // Trouver l'élément à supprimer pour récupérer le productId
    const itemToRemove = this.cartItems.find(item => item.id === id);
    if (!itemToRemove) {
      console.error('Item not found in cart');
      return;
    }

    console.log('🗑️ Removing item:', itemToRemove);
    
    // Supprimer localement d'abord pour une réaction rapide de l'UI
    this.cartItems = this.cartItems.filter(item => item.id !== id);
    this.calculateTotal();

    // Appeler l'API backend pour supprimer définitivement
    this.cartService.removeFromCart(currentUser.id, itemToRemove.productId).subscribe({
      next: () => {
        console.log('✅ Item successfully removed from backend');
      },
      error: (error) => {
        console.error('❌ Error removing item from backend:', error);
        // En cas d'erreur, rechargeons le panier pour rester synchronisé
        this.notificationService.error('Error removing item. Reloading cart...');
        this.loadCartItems();
      }
    });
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

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.notificationService.info('Please login to complete your order');
      this.router.navigate(['/login']);
      return;
    }

    // Rediriger vers la page checkout au lieu de valider directement
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

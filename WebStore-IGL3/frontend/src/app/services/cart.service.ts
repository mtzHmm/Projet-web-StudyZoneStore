import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { CartItem } from '../models/cart-item.interface';
import { LOCAL_STORAGE_KEYS as STORAGE_KEYS, MOCK_PRODUCTS } from './mock-data';

interface CartItemLocal extends CartItem {
  productId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<CartItemLocal[]>([]);
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    console.log('🛒 CartService initialized with localStorage');
  }

  // Récupérer les items du panier
  getCartItems(userId: number): Observable<CartItem[]> {
    const cartData = this.getCartFromStorage(userId);
    return of(cartData).pipe(delay(300));
  }

  // Ajouter un produit au panier
  addToCart(userId: number, productId: number, quantity: number): Observable<CartItem> {
    const cart = this.getCartFromStorage(userId);
    const existingItem = cart.find(item => item.productId === productId);

    let updatedItem: CartItemLocal;

    if (existingItem) {
      // Update quantity if product already in cart
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.price * existingItem.quantity;
      updatedItem = existingItem;
    } else {
      // Find actual product data from mock products
      const mockProduct = MOCK_PRODUCTS.find(p => p.id === productId);
      
      // Add new item with real product data
      updatedItem = {
        id: Math.random(),
        productId,
        name: mockProduct?.name || `Product ${productId}`,
        price: mockProduct?.price || 29.99,
        quantity,
        imageUrl: mockProduct?.imageUrl || '/assets/images/placeholder.jpg',
        totalPrice: (mockProduct?.price || 29.99) * quantity
      };
      cart.push(updatedItem);
    }

    this.saveCartToStorage(userId, cart);
    console.log('✅ Item added to cart:', updatedItem);
    return of(updatedItem).pipe(delay(300));
  }

  // Supprimer un produit du panier
  removeFromCart(userId: number, productId: number): Observable<void> {
    const cart = this.getCartFromStorage(userId);
    const index = cart.findIndex(item => item.productId === productId);

    if (index !== -1) {
      cart.splice(index, 1);
      this.saveCartToStorage(userId, cart);
      console.log('✅ Item removed from cart, productId:', productId);
    }

    return of(void 0).pipe(delay(300));
  }

  // Vider le panier
  clearCart(userId: number): Observable<void> {
    localStorage.removeItem(this.getCartKey(userId));
    this.cartSubject.next([]);
    console.log('✅ Cart cleared for user:', userId);
    return of(void 0).pipe(delay(300));
  }

  // Récupérer le total du panier
  getCartTotal(userId: number): Observable<{ total: number }> {
    const cart = this.getCartFromStorage(userId);
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return of({ total }).pipe(delay(300));
  }

  // Checkout (convertir panier en commande)
  checkout(userId: number): Observable<any> {
    const cart = this.getCartFromStorage(userId);
    
    if (cart.length === 0) {
      return of({ success: false, message: 'Cart is empty' }).pipe(delay(300));
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Clear the cart after checkout
    this.clearCart(userId).subscribe();

    return of({
      success: true,
      message: 'Checkout successful',
      total,
      itemCount: cart.length,
      timestamp: new Date()
    }).pipe(delay(500));
  }

  // ==================== LOCAL STORAGE HELPERS ====================

  private getCartKey(userId: number): string {
    return `${STORAGE_KEYS.CART}_${userId}`;
  }

  private getCartFromStorage(userId: number): CartItemLocal[] {
    try {
      // For now, always return fresh demo data to see the mock products
      console.log('🛒 Returning fresh demo cart items');
      return this.createDemoCartItems();
      
      // Original code (commented out temporarily):
      // const data = localStorage.getItem(this.getCartKey(userId));
      // if (data) {
      //   return JSON.parse(data);
      // } else {
      //   return this.createDemoCartItems();
      // }
    } catch (error) {
      console.error('Error reading cart from storage:', error);
      return this.createDemoCartItems();
    }
  }

  private createDemoCartItems(): CartItemLocal[] {
    // Get some products from mock data for demo cart
    const product1 = MOCK_PRODUCTS.find(p => p.id === 1); // Black T-Shirt
    const product2 = MOCK_PRODUCTS.find(p => p.id === 3); // Navy Hoodie
    
    const demoItems: CartItemLocal[] = [];
    
    if (product1) {
      demoItems.push({
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
      demoItems.push({
        id: 2,
        productId: product2.id,
        name: product2.name,
        price: product2.price,
        quantity: 1,
        totalPrice: product2.price * 1,
        imageUrl: product2.imageUrl || '/assets/images/placeholder.jpg'
      });
    }
    
    console.log('Created demo cart items:', demoItems);
    return demoItems;
  }

  private saveCartToStorage(userId: number, cart: CartItemLocal[]): void {
    try {
      localStorage.setItem(this.getCartKey(userId), JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }
}
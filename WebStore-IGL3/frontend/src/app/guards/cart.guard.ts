import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

export const cartGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const cartService = inject(CartService);
  const router = inject(Router);

  // First check if user is logged in
  if (!authService.isLoggedIn()) {
    console.log('🚫 Access denied - User not authenticated');
    router.navigate(['/sign-in'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Get current user
  const currentUser = authService.getCurrentUser();
  if (!currentUser?.id) {
    console.log('🚫 Access denied - No user ID found');
    router.navigate(['/sign-in']);
    return false;
  }

  // Check if cart has items
  return cartService.getCartItems(currentUser.id).pipe(
    map(cartItems => {
      if (cartItems && cartItems.length > 0) {
        console.log('✅ Cart has items - Access granted to checkout');
        return true;
      } else {
        console.log('🚫 Cart is empty - Redirecting to shop');
        router.navigate(['/shop'], { 
          queryParams: { 
            message: 'Please add products to your cart first',
            messageType: 'warning'
          } 
        });
        return false;
      }
    }),
    catchError(error => {
      console.error('❌ Error checking cart:', error);
      router.navigate(['/shop']);
      return of(false);
    })
  );
};

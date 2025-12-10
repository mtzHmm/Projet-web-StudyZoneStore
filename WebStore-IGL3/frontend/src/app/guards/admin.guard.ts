import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // First check if user is logged in
  if (!authService.isLoggedIn()) {
    console.log('🚫 Access denied - User not authenticated');
    router.navigate(['/sign-in'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  // Then check if user is admin
  if (authService.isAdmin()) {
    return true;
  }

  // Redirect to home page if not admin
  console.log('🚫 Access denied - User is not an admin');
  router.navigate(['/']);
  return false;
};

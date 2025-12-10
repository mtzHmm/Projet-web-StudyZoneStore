import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const verify2faGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  
  // Check if navigation state contains email (passed from registration/login)
  const navigation = router.getCurrentNavigation();
  const hasEmail = navigation?.extras?.state?.['email'];
  
  // Also check sessionStorage for email (in case of page refresh)
  const storedEmail = sessionStorage.getItem('pending_2fa_email');
  
  if (hasEmail || storedEmail) {
    // If email is in navigation state, store it in sessionStorage
    if (hasEmail && !storedEmail) {
      sessionStorage.setItem('pending_2fa_email', hasEmail);
    }
    return true;
  }
  
  // If no email context, redirect to sign-in
  console.log('🚫 Access denied - No 2FA verification context');
  router.navigate(['/sign-in']);
  return false;
};

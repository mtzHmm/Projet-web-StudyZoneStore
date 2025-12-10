import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.interface';
import { NotificationService } from '../../services/notification.service';

interface CheckoutForm {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  countryCode: string;
  paymentMethod: string;
  deliveryMethod: string;
}

interface CountryCode {
  code: string;
  name: string;
  flag: string;
  format: string;
}

interface OrderSummary {
  subtotal: number;
  total: number;
  itemCount: number;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class Checkout implements OnInit, OnDestroy {
  checkoutForm: CheckoutForm = {
    firstName: '',
    lastName: '',
    phoneNumber: '',
    countryCode: '+216',
    paymentMethod: 'cash',
    deliveryMethod: 'pickup'
  };

  countryCodes: CountryCode[] = [
    { code: '+216', name: 'Tunisia', flag: '🇹🇳', format: 'XX XXX XXX' },
    { code: '+33', name: 'France', flag: '🇫🇷', format: 'X XX XX XX XX' }
  ];

  orderSummary: OrderSummary = {
    subtotal: 0,
    total: 0,
    itemCount: 0
  };

  isOrderSubmitted: boolean = false;
  orderId: string = '#0120';
  isUserAuthenticated: boolean = false;
  cartItems: CartItem[] = [];
  loading: boolean = true;

  constructor(private router: Router, private authService: AuthService, private cartService: CartService, private notificationService: NotificationService) {
    // Debug: Vérifier les données dans localStorage
    const userData = localStorage.getItem('user');
    console.log('localStorage user data:', userData);
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log('Parsed user data:', parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }

  ngOnInit() {
    // Initialisation du composant
    this.generateOrderId();
    this.loadCartItems();
    
    // Récupérer les informations de l'utilisateur connecté
    this.authService.currentUser$.subscribe(user => {
      console.log('User data from subscription:', user);
      if (user) {
        console.log('User firstName:', user.firstName);
        console.log('User lastName:', user.lastName);
        
        // Remplir les champs avec les données utilisateur
        this.checkoutForm.firstName = user.firstName || '';
        
        // Si lastName est vide, essayer de le générer ou utiliser une valeur par défaut
        if (user.lastName && user.lastName.trim() !== '') {
          this.checkoutForm.lastName = user.lastName;
        } else {
          // Générer un lastName basé sur le firstName ou email
          this.checkoutForm.lastName = this.generateLastName(user);
        }
        
        this.isUserAuthenticated = true;
        console.log('Checkout form after update:', this.checkoutForm);
        console.log('Is user authenticated:', this.isUserAuthenticated);
      } else {
        this.isUserAuthenticated = false;
        console.log('No user data available');
      }
    });
  }

  proceedToCheckout() {
    // Vérification du panier vide
    if (!this.cartItems || this.cartItems.length === 0) {
      this.notificationService.warning('Your cart is empty. Please add items to your cart first.');
      this.router.navigate(['/shop']);
      return;
    }

    // Vérification si l'utilisateur est connecté
    if (!this.authService.isLoggedIn()) {
      this.notificationService.info('Please login to continue with checkout');
      // Rediriger vers la page de connexion
      this.router.navigate(['/sign-in']);
      return;
    }

    // Validation des champs obligatoires
    if (!this.checkoutForm.firstName || !this.checkoutForm.lastName || !this.checkoutForm.phoneNumber) {
      this.notificationService.warning('Please fill in all required fields');
      return;
    }

    // Validation du numéro de téléphone
    if (!this.isValidPhoneNumber(this.checkoutForm.phoneNumber)) {
      this.notificationService.error('Please enter a valid phone number');
      return;
    }

    const currentUser = this.authService.getCurrentUser();
    if (!currentUser || !currentUser.id) {
      this.notificationService.error('Authentication error. Please login again.');
      this.router.navigate(['/sign-in']);
      return;
    }

    console.log('🛒 Proceeding to checkout with form:', this.checkoutForm);
    console.log('🔍 User ID:', currentUser.id);

    // Appel API pour créer la commande réelle
    this.cartService.checkout(currentUser.id).subscribe({
      next: (response) => {
        console.log('✅ Checkout réussi:', response);
        if (response.success) {
          // Mettre à jour l'orderId avec la réponse du serveur
          this.orderId = `#${response.orderId}`;
          
          // Afficher la page de confirmation
          this.isOrderSubmitted = true;
          document.body.style.overflow = 'hidden';
          
          console.log('Order submitted successfully:', {
            orderId: this.orderId,
            form: this.checkoutForm,
            response: response
          });
        } else {
          this.notificationService.error('Error: ' + response.message);
        }
      },
      error: (error) => {
        console.error('❌ Erreur checkout:', error);
        const errorMessage = error.error?.message || 'Error processing order';
        this.notificationService.error('Error: ' + errorMessage);
      }
    });
  }

  private generateLastName(user: any): string {
    // Si nous avons un lastName dans les données utilisateur, l'utiliser
    if (user.lastName && user.lastName.trim() !== '') {
      return user.lastName;
    }
    
    // Sinon, générer un lastName basé sur l'email ou le firstName
    if (user.email) {
      // Extraire le nom de l'email (partie avant @)
      const emailName = user.email.split('@')[0];
      // Si l'emailName est différent du firstName, l'utiliser comme lastName
      if (emailName !== user.firstName) {
        return emailName;
      }
    }
    
    // Si firstName contient plusieurs mots, prendre le dernier comme lastName
    if (user.firstName && user.firstName.includes(' ')) {
      const nameParts = user.firstName.split(' ');
      return nameParts[nameParts.length - 1];
    }
    
    // Fallback: utiliser le firstName + "User" comme lastName
    return (user.firstName || 'User') + 'User';
  }

  private isValidPhoneNumber(phone: string): boolean {
    // Remove all spaces and non-digit characters for validation
    const cleanPhone = phone.replace(/\s+/g, '').replace(/\D/g, '');
    
    // Check minimum 8 digits
    return cleanPhone.length >= 8;
  }

  formatPhoneNumber(event: any) {
    const input = event.target;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    
    const selectedCountry = this.countryCodes.find(c => c.code === this.checkoutForm.countryCode);
    if (!selectedCountry) {
      this.checkoutForm.phoneNumber = value;
      return;
    }

    let formatted = '';
    let maxLength = 0;
    
    switch(this.checkoutForm.countryCode) {
      case '+216': // Tunisia: XX XXX XXX (8 digits)
        maxLength = 8;
        value = value.substring(0, maxLength);
        if (value.length > 0) formatted += value.substring(0, 2);
        if (value.length > 2) formatted += ' ' + value.substring(2, 5);
        if (value.length > 5) formatted += ' ' + value.substring(5, 8);
        break;
        
      case '+33': // France: X XX XX XX XX (9 digits)
        maxLength = 9;
        value = value.substring(0, maxLength);
        if (value.length > 0) formatted += value.substring(0, 1);
        if (value.length > 1) formatted += ' ' + value.substring(1, 3);
        if (value.length > 3) formatted += ' ' + value.substring(3, 5);
        if (value.length > 5) formatted += ' ' + value.substring(5, 7);
        if (value.length > 7) formatted += ' ' + value.substring(7, 9);
        break;
        
      default:
        formatted = value;
    }
    
    this.checkoutForm.phoneNumber = formatted;
  }

  onCountryCodeChange() {
    // Clear phone number when country code changes
    this.checkoutForm.phoneNumber = '';
  }

  getSelectedCountryFormat(): string {
    const selectedCountry = this.countryCodes.find(c => c.code === this.checkoutForm.countryCode);
    return selectedCountry?.format || 'XX XXX XXX';
  }

  getMaxPhoneLength(): number {
    // Return max length including spaces for formatted display
    switch(this.checkoutForm.countryCode) {
      case '+216': // Tunisia: 8 digits + 2 spaces = 10
        return 10;
      case '+33': // France: 9 digits + 4 spaces = 13
        return 13;
      default:
        return 15;
    }
  }

  private generateOrderId() {
    // Génération d'un ID de commande aléatoire
    const randomNum = Math.floor(Math.random() * 9999) + 1;
    this.orderId = `#${randomNum.toString().padStart(4, '0')}`;
  }

  private loadCartItems() {
    this.loading = true;
    const currentUser = this.authService.getCurrentUser();
    
    // Utiliser l'ID utilisateur s'il est connecté, sinon 0 pour les invités
    let userId = 0;
    if (currentUser && currentUser.id) {
      userId = currentUser.id;
      console.log('🔍 Loading cart for authenticated user:', userId);
    } else {
      console.log('🔍 Loading cart for guest user (userId = 0)');
    }
    
    console.log('🔐 Is authenticated:', this.authService.isLoggedIn());

    this.cartService.getCartItems(userId).subscribe({
      next: (response: CartItem[]) => {
        console.log('✅ Cart items loaded successfully:', response);
        this.cartItems = response || [];
        console.log('� Items count:', this.cartItems.length);
        if (this.cartItems.length > 0) {
          console.log('📊 First item:', this.cartItems[0]);
        }
        this.calculateOrderSummary();
        this.loading = false;
      },
      error: (error) => {
        console.error('❌ Error loading cart items:', error);
        if (error.status === 404) {
          console.log('ℹ️ No cart items found - cart is empty');
        } else {
          console.error('Error details:', error.error);
          console.error('Response status:', error.status);
        }
        this.cartItems = [];
        this.calculateOrderSummary();
        this.loading = false;
      }
    });
  }

  private calculateOrderSummary() {
    if (!this.cartItems || this.cartItems.length === 0) {
      this.orderSummary = {
        subtotal: 0,
        total: 0,
        itemCount: 0
      };
      return;
    }

    // Calculer le sous-total
    const subtotal = this.cartItems.reduce((sum, item) => {
      const price = item.price || 0;
      const quantity = item.quantity || 0;
      console.log('🔢 Calculating for item:', item.name, 'price:', price, 'quantity:', quantity);
      return sum + (price * quantity);
    }, 0);

    // Calculer le nombre total d'articles
    const itemCount = this.cartItems.reduce((sum, item) => {
      return sum + (item.quantity || 0);
    }, 0);

    // Pour l'instant, le total = sous-total (pas de taxes/frais de livraison)
    const total = subtotal;

    this.orderSummary = {
      subtotal: subtotal,
      total: total,
      itemCount: itemCount
    };

    console.log('Order summary calculated:', this.orderSummary);
  }

  backToShop() {
    // Restore page scrolling before navigating
    document.body.style.overflow = 'auto';
    // Navigate back to the shop/landing page
    this.router.navigate(['/landing']);
  }

  ngOnDestroy() {
    // Restore page scrolling when component is destroyed
    document.body.style.overflow = 'auto';
  }
}

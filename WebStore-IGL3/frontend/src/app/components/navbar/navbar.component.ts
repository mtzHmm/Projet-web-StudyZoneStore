import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, User } from '../../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navbar',
  imports: [RouterModule, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {
  isMobileMenuOpen = false;
  currentUser: User | null = null;
  cartItemCount = 0; // Cart item count for badge display
  private userSubscription: Subscription = new Subscription();

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // S'abonner aux changements de l'utilisateur connecté
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngOnDestroy() {
    this.userSubscription.unsubscribe();
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  // Getter pour obtenir le nom d'affichage
  get displayName(): string {
    if (!this.currentUser) return 'MOSTAFA'; // Fallback
    
    if (this.currentUser.firstName) {
      return this.currentUser.firstName.toUpperCase();
    }
    
    // Si pas de prénom, utiliser la partie avant @ de l'email
    return this.currentUser.email.split('@')[0].toUpperCase();
  }

  // Méthode de déconnexion
  logout() {
    this.authService.logout();
    this.closeMobileMenu(); // Fermer le menu mobile si ouvert
    this.router.navigate(['/']); // Rediriger vers la page d'accueil
  }
}

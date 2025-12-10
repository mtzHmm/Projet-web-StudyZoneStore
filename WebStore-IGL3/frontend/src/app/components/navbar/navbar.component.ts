import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

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
    private router: Router
  ) {}

  ngOnInit() {
    // No authentication - user is always null
    this.currentUser = null;
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
    return 'GUEST'; // No authentication - show guest
  }
}

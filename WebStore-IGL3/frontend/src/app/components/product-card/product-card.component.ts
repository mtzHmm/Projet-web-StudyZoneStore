import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FavoritesService } from '../../services/favorites.service';

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  isClothing: boolean;
  imageUrl?: string;
}

@Component({
  selector: 'app-product-card',
  imports: [CommonModule],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {
  @Input() product!: Product;
  @Output() viewDetails = new EventEmitter<Product>();
  @Output() addToCart = new EventEmitter<Product>();

  constructor(
    private router: Router,
    private favoritesService: FavoritesService
  ) {}

  /**
   * Vérifier si le produit est dans les favoris
   */
  isFavorite(): boolean {
    return this.favoritesService.isFavorite(this.product.id);
  }

  /**
   * Basculer l'état favori du produit
   */
  toggleFavorite(event: Event): void {
    event.stopPropagation(); // Empêcher la navigation vers les détails
    const isNowFavorite = this.favoritesService.toggleFavorite(this.product.id);
    
    if (isNowFavorite) {
      console.log('⭐ Produit ajouté aux favoris:', this.product.name);
    } else {
      console.log('💔 Produit retiré des favoris:', this.product.name);
    }
  }

  onViewDetails() {
    console.log('Product details:', this.product);
    console.log('Navigating to details page for product:', this.product.id);
    
    // Navigate to the details page for all products
    this.router.navigate(['/details', this.product.id]);
  }

  onAddToCart() {
    this.addToCart.emit(this.product);
  }
}

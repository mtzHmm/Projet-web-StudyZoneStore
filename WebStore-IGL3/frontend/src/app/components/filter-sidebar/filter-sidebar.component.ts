import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../services/product.service';
import { FavoritesService } from '../../services/favorites.service';
import { Category } from '../../models/category.interface';

@Component({
  selector: 'app-filter-sidebar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filter-sidebar.component.html',
  styleUrl: './filter-sidebar.component.css'
})
export class FilterSidebarComponent implements OnInit {
  @Output() filtersChange = new EventEmitter<any>();

  searchKeyword: string = '';
  selectedCategory: string = '';
  minPrice: string = '';
  maxPrice: string = '';
  categories: Category[] = [];
  showPriceWarning: boolean = false; // Nouvelle propriété pour l'avertissement
  showFavoritesOnly: boolean = false; // Nouvelle propriété pour le filtre favoris
  favoritesCount: number = 0; // Nombre de favoris

  constructor(
    private productService: ProductService,
    private favoritesService: FavoritesService
  ) {}

  ngOnInit() {
    this.loadCategories();
    this.updateFavoritesCount();
    
    // S'abonner aux changements des favoris
    this.favoritesService.getFavorites().subscribe(() => {
      this.updateFavoritesCount();
      // Re-émettre les filtres si on affiche seulement les favoris
      if (this.showFavoritesOnly) {
        this.emitFilters();
      }
    });
  }

  private updateFavoritesCount() {
    this.favoritesCount = this.favoritesService.getFavoritesCount();
  }

  loadCategories() {
    this.productService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
      },
      error: (error: any) => {
        console.error('Error loading categories:', error);
        this.categories = [
          { id: 1, name: 'Electronics' },
          { id: 2, name: 'Clothing' },
          { id: 3, name: 'Books' },
          { id: 4, name: 'Sports' },
          { id: 5, name: 'Home' }
        ];
      }
    });
  }

  onSearchChange() {
    this.emitFilters();
  }

  onCategoryChange() {
    this.emitFilters();
  }

  onFavoritesFilterChange() {
    console.log('🌟 Filtre favoris changé:', this.showFavoritesOnly);
    this.emitFilters();
  }

  // Méthode appelée à chaque frappe - SEULEMENT pour nettoyer, pas de validation
  onMinPriceInput() {
    this.minPrice = this.sanitizeNumericInput(this.minPrice);
    this.checkPriceWarning();
  }

  onMaxPriceInput() {
    this.maxPrice = this.sanitizeNumericInput(this.maxPrice);
    this.checkPriceWarning();
  }

  // Vérifier s'il faut afficher un avertissement visuel
  private checkPriceWarning() {
    const minValue = this.minPrice && this.minPrice.trim() !== '' ? Number(this.minPrice) : null;
    const maxValue = this.maxPrice && this.maxPrice.trim() !== '' ? Number(this.maxPrice) : null;
    
    this.showPriceWarning = (minValue !== null && maxValue !== null && minValue >= maxValue);
  }

  // Méthode appelée quand l'utilisateur termine (blur ou Enter) - Validation + émission
  onMinPriceChange() {
    this.minPrice = this.sanitizeNumericInput(this.minPrice);
    this.emitFilters();
  }

  onMaxPriceChange() {
    this.maxPrice = this.sanitizeNumericInput(this.maxPrice);
    this.emitFilters();
  }

  // Méthode pour nettoyer l'input et ne garder que les nombres entiers
  private sanitizeNumericInput(value: string): string {
    if (!value) return '';
    
    // Enlever tous les caractères non numériques (seulement 0-9)
    let cleaned = value.replace(/[^0-9]/g, '');
    
    return cleaned;
  }

  // Méthode pour gérer les touches du clavier - SEULEMENT CHIFFRES
  onKeyPress(event: KeyboardEvent): boolean {
    const charCode = event.which ? event.which : event.keyCode;
    
    // Autoriser: backspace, delete, tab, escape, enter, flèches
    if ([8, 9, 27, 13, 46, 37, 38, 39, 40].indexOf(charCode) !== -1 ||
        // Autoriser: Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
        (charCode === 65 && event.ctrlKey === true) ||
        (charCode === 67 && event.ctrlKey === true) ||
        (charCode === 86 && event.ctrlKey === true) ||
        (charCode === 88 && event.ctrlKey === true)) {
      return true;
    }
    
    // Autoriser SEULEMENT les chiffres (0-9) - PAS de point décimal
    if (charCode >= 48 && charCode <= 57) {
      return true;
    }
    
    // Bloquer tout le reste (lettres, symboles, etc.)
    event.preventDefault();
    return false;
  }

  // Méthode pour gérer le collage (paste) - nettoyer automatiquement
  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pasteData = event.clipboardData?.getData('text') || '';
    const cleanedData = this.sanitizeNumericInput(pasteData);
    
    // Determine which field was being pasted into
    const target = event.target as HTMLInputElement;
    if (target.placeholder === 'Min') {
      this.minPrice = cleanedData;
      this.onMinPriceChange();
    } else if (target.placeholder === 'Max') {
      this.maxPrice = cleanedData;
      this.onMaxPriceChange();
    }
  }

  clearSearch() {
    this.searchKeyword = '';
    this.emitFilters();
  }

  private emitFilters() {
    // Trouver l'ID de la catégorie sélectionnée
    let categoryId = undefined;
    if (this.selectedCategory) {
      const selectedCat = this.categories.find(cat => cat.name === this.selectedCategory);
      categoryId = selectedCat ? selectedCat.id : undefined;
    }

    // Logique de prix selon les spécifications
    let finalMinPrice: number | undefined = undefined;
    let finalMaxPrice: number | undefined = undefined;
    
    const minValue = this.minPrice && this.minPrice.trim() !== '' ? Number(this.minPrice) : null;
    const maxValue = this.maxPrice && this.maxPrice.trim() !== '' ? Number(this.maxPrice) : null;
    
    // Cas 1: Seulement Max spécifié → Min = 0 automatiquement
    if (maxValue !== null && minValue === null) {
      finalMinPrice = 0;
      finalMaxPrice = maxValue;
      console.log('🔧 Cas 1: Seulement Max spécifié → Min=0, Max=' + maxValue);
    }
    // Cas 2: Seulement Min spécifié → Pas de limite Max
    else if (minValue !== null && maxValue === null) {
      finalMinPrice = minValue;
      finalMaxPrice = undefined; // Pas de limite maximum
      console.log('🔧 Cas 2: Seulement Min spécifié → Min=' + minValue + ', Max=illimité');
    }
    // Cas 3: Min ET Max spécifiés → Intervalle complet
    else if (minValue !== null && maxValue !== null) {
      // S'assurer que min < max SEULEMENT lors de l'émission finale
      if (minValue >= maxValue) {
        console.warn('⚠️ Min >= Max, correction automatique lors de la recherche');
        finalMinPrice = Math.min(minValue, maxValue);
        finalMaxPrice = Math.max(minValue, maxValue);
      } else {
        finalMinPrice = minValue;
        finalMaxPrice = maxValue;
      }
      console.log('🔧 Cas 3: Intervalle → Min=' + finalMinPrice + ', Max=' + finalMaxPrice);
    }
    // Cas 4: Aucun prix spécifié → Tous les produits
    else {
      finalMinPrice = undefined;
      finalMaxPrice = undefined;
      console.log('🔧 Cas 4: Aucun prix → Tous les produits');
    }

    const filters = {
      searchQuery: this.searchKeyword.trim(),
      categoryId: categoryId,
      minPrice: finalMinPrice,
      maxPrice: finalMaxPrice,
      showFavoritesOnly: this.showFavoritesOnly,
      favoriteIds: this.showFavoritesOnly ? this.favoritesService.getCurrentFavorites() : undefined
    };
    
    console.log('🔧 Filtres émis depuis filter-sidebar:', filters);
    this.filtersChange.emit(filters);
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FilterSidebarComponent } from '../../components/filter-sidebar/filter-sidebar.component';
import { ProductCardComponent } from '../../components/product-card/product-card.component';
import { Product, ProductResponse } from '../../models/product.interface';
import { ProductService } from '../../services/product.service';
import { CategoryService, Category } from '../../services/category.service';

interface FilterOptions {
  searchQuery?: string;
  categoryId?: number;
  isClothing?: boolean;
  inStock?: boolean;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: string;
  showFavoritesOnly?: boolean;
  favoriteIds?: number[];
}

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, FormsModule, FilterSidebarComponent, ProductCardComponent],
  templateUrl: './shop.component.html',
  styleUrl: './shop.component.css'
})
export class ShopComponent implements OnInit {
  // Product data
  products: Product[] = [];
  categories: Category[] = [];
  loading = false;
  errorMessage = '';
  
  // Pagination & sorting
  currentPage = 0;
  pageSize = 12;
  sortField = 'name';
  sortDirection = 'asc';
  totalPages = 0;
  totalProducts = 0;
  
  // View mode
  viewMode: 'grid' | 'list' = 'grid';
  currentFilters: FilterOptions = {};

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    // Charger les catégories
    this.categoryService.categories$.subscribe(categories => {
      this.categories = categories;
    });
    
    // Charger les produits
    this.loadProducts();
  }

  /** Load products with filters, pagination, sorting - UNIFIED METHOD */
  loadProducts() {
    console.log('🔄 loadProducts() - Loading with unified filters:', this.currentFilters);
    this.loading = true;
    this.errorMessage = '';

    // Use the new unified method that handles ALL filters together
    this.productService.getProductsWithAllFilters(
      this.currentPage,
      this.pageSize,
      this.sortField,
      this.sortDirection,
      this.currentFilters
    ).subscribe({
      next: (response: ProductResponse) => {
        console.log('✅ Products with unified filters received:', response.content.length, 'products');
        console.log('📊 Complete response:', response);
        
        this.products = response.content;
        this.totalPages = response.totalPages;
        this.totalProducts = response.totalElements;
        this.loading = false;
        
        // Display informative message if no products match the filters
        if (this.products.length === 0) {
          this.errorMessage = this.buildNoResultsMessage();
        } else {
          this.errorMessage = '';
        }
      },
      error: error => {
        console.error('❌ Error loading products:', error);
        this.products = [];
        this.totalProducts = 0;
        this.totalPages = 0;
        this.errorMessage = 'Error loading products';
        this.loading = false;
      }
    });
  }

  /** Build an informative message when no products are found */
  private buildNoResultsMessage(): string {
    const activeFilters = [];
    
    if (this.currentFilters.searchQuery) {
      activeFilters.push(`keyword "${this.currentFilters.searchQuery}"`);
    }
    if (this.currentFilters.categoryId) {
      const category = this.categories.find(c => c.id === this.currentFilters.categoryId);
      activeFilters.push(`category "${category?.name || 'selected'}"`);
    }
    if (this.currentFilters.showFavoritesOnly) {
      activeFilters.push(`favorite products`);
    }
    if (this.currentFilters.minPrice || this.currentFilters.maxPrice) {
      const priceRange = `price between ${this.currentFilters.minPrice || 0} and ${this.currentFilters.maxPrice || '∞'} DT`;
      activeFilters.push(priceRange);
    }
    if (this.currentFilters.isClothing !== undefined) {
      activeFilters.push(this.currentFilters.isClothing ? 'clothing' : 'non-clothing');
    }
    
    if (activeFilters.length === 0) {
      return 'No products available';
    } else if (activeFilters.length === 1) {
      return `No products found for ${activeFilters[0]}`;
    } else {
      const lastFilter = activeFilters.pop();
      return `No products found for ${activeFilters.join(', ')} and ${lastFilter}`;
    }
  }

  /** Fallback to mock products if backend is unavailable */
  loadMockProducts() {
    this.products = this.generateMockProducts();
    this.totalProducts = this.products.length;
    this.totalPages = Math.ceil(this.totalProducts / this.pageSize);
    this.loading = false;
    this.errorMessage = '';
  }

  /** Map backend product data to our interface */
  mapBackendProducts(backendProducts: any[]): Product[] {
    return backendProducts.map(p => ({
      id: p.id || Math.floor(Math.random() * 10000),
      name: p.name || 'Unknown Product',
      price: p.price || 0,
      imageUrl: p.imageUrl || '/assets/images/placeholder.jpg',
      description: p.description || '',
      stock: p.stock || 0,
      isClothing: p.isClothing || false,
      category: p.category || undefined
    }));
  }

  /** Generate mock products for development */
  generateMockProducts(): Product[] {
    return [
      {
        id: 1,
        name: 'WebStore-IGL3 Hoodie',
        price: 45,
        imageUrl: '/assets/images/hoodie.jpg',
        description: 'Comfortable hoodie with WebStore-IGL3 logo',
        stock: 10,
        isClothing: true
      },
      {
        id: 2,
        name: 'WebStore-IGL3 T-Shirt',
        price: 25,
        imageUrl: '/assets/images/tshirt.jpg',
        description: 'Classic WebStore-IGL3 t-shirt',
        stock: 15,
        isClothing: true
      },
      {
        id: 3,
        name: 'WebStore-IGL3 Mug',
        price: 15,
        imageUrl: '/assets/images/mug.jpg',
        description: 'Coffee mug with WebStore-IGL3 branding',
        stock: 5,
        isClothing: false
      },
      {
        id: 4,
        name: 'WebStore-IGL3 Cap',
        price: 20,
        imageUrl: '/assets/images/cap.jpg',
        description: 'Stylish cap with embroidered logo',
        stock: 0,
        isClothing: true
      }
    ];
  }

  /** Change page */
  changePage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  /** Change sorting */
  changeSort(field: string) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.loadProducts();
  }

  /** Set view mode */
  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  /** Handle filter changes from sidebar - TOUJOURS FETCH */
  onFiltersChanged(filters: FilterOptions) {
    console.log('🔄 ===== FILTRES CHANGÉS =====');
    console.log('🔍 Recherche:', filters.searchQuery);
    console.log('🏷️ Catégorie ID:', filters.categoryId);
    console.log('💰 Prix min:', filters.minPrice);
    console.log('💰 Prix max:', filters.maxPrice);
    console.log('⭐ Favoris seulement:', filters.showFavoritesOnly);
    console.log('📊 Tous les filtres:', filters);
    
    this.currentFilters = filters;
    this.currentPage = 0; // Reset to first page when filters change
    this.errorMessage = ''; // Clear any previous error messages
    
    // Si on filtre par favoris et qu'il n'y en a pas, ne pas charger
    if (filters.showFavoritesOnly && (!filters.favoriteIds || filters.favoriteIds.length === 0)) {
      console.log('📭 Aucun favori à afficher');
      this.products = [];
      this.totalProducts = 0;
      this.totalPages = 0;
      this.loading = false;
      return;
    }
    
    // TOUJOURS charger depuis le serveur
    this.loadProducts();
  }

  /** Handle view details */
  onViewDetails(product: Product) {
    console.log('View details for product:', product.id);
    // Navigate to product details page
  }

  /** Handle add to cart */
  onAddToCart(product: Product) {
    console.log('Add to cart:', product.id);
    // Add product to cart logic
  }
}

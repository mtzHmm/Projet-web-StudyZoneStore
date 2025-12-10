import { Component, Input, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Category {
  id: number;
  categoryName: string;
  products: string[];
  editing?: boolean;
}

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
export class CategoryManagementComponent implements AfterViewInit, OnDestroy {
  @ViewChild('categoryScroll', { static: false }) categoryScroll!: ElementRef;

  // Pagination properties
  currentPage = 1;
  pageSize = 10;
  isLoading = false;
  hasMoreData = true;

  // All categories (simulated database)
  private allCategories: Category[] = [];
  
  // Currently displayed categories
  categories: Category[] = [];
  
  @Input() searchTerm: string = '';
  private searchTimeout: any;
  
  constructor() {
    this.initializeAllCategories();
    this.loadMoreCategories();
  }

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  ngOnDestroy() {
    if (this.categoryScroll?.nativeElement) {
      this.categoryScroll.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  // Initialize large dataset of categories
  private initializeAllCategories() {
    const categoryNames = [
      'Vêtements', 'Accessoires', 'Goodies', 'Électronique', 'Livres', 'Sport', 'Maison', 'Jardin', 
      'Beauté', 'Santé', 'Jouets', 'Auto', 'Bricolage', 'Animaux', 'Musique', 'Informatique',
      'Gaming', 'Cuisine', 'Décoration', 'Mobilier', 'Chaussures', 'Sacs', 'Montres', 'Bijoux'
    ];
    
    const productSamples = [
      ['T-shirt', 'Pantalon', 'Veste'],
      ['Casquette', 'Ceinture', 'Gants'],
      ['Mug', 'Porte-clés', 'Stickers'],
      ['Smartphone', 'Ordinateur', 'Tablette'],
      ['Roman', 'BD', 'Magazine'],
      ['Ballon', 'Raquette', 'Chaussures de sport'],
      ['Coussin', 'Rideau', 'Tapis'],
      ['Plantes', 'Outils', 'Engrais'],
      ['Parfum', 'Crème', 'Mascara'],
      ['Vitamines', 'Pansements', 'Thermomètre']
    ];

    for (let i = 1; i <= 100; i++) {
      const categoryName = categoryNames[Math.floor(Math.random() * categoryNames.length)];
      const sampleProducts = productSamples[Math.floor(Math.random() * productSamples.length)];
      const numProducts = Math.floor(Math.random() * 3) + 1; // 1 to 3 products
      const selectedProducts = sampleProducts.slice(0, numProducts);

      this.allCategories.push({
        id: i,
        categoryName: `${categoryName} ${i}`,
        products: selectedProducts,
        editing: false
      });
    }
  }

  // Setup infinite scroll
  private setupInfiniteScroll() {
    if (this.categoryScroll?.nativeElement) {
      this.categoryScroll.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  // Handle scroll event
  private onScroll() {
    const element = this.categoryScroll.nativeElement;
    const threshold = 100; // Load more when 100px from bottom
    
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - threshold) {
      if (!this.isLoading && this.hasMoreData) {
        this.loadMoreCategories();
      }
    }
  }

  // Load more categories with pagination
  private loadMoreCategories() {
    if (this.isLoading || !this.hasMoreData) return;

    this.isLoading = true;

    // Simulate API delay
    setTimeout(() => {
      const startIndex = (this.currentPage - 1) * this.pageSize;
      const endIndex = startIndex + this.pageSize;
      const newCategories = this.allCategories.slice(startIndex, endIndex);

      if (newCategories.length > 0) {
        this.categories = [...this.categories, ...newCategories];
        this.currentPage++;
      }

      if (endIndex >= this.allCategories.length) {
        this.hasMoreData = false;
      }

      this.isLoading = false;
    }, 500);
  }

  // Search functionality with debouncing
  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.resetPagination();
      this.loadMoreCategories();
    }, 300);
  }

  // Reset pagination for new search
  private resetPagination() {
    this.currentPage = 1;
    this.categories = [];
    this.hasMoreData = true;
    this.isLoading = false;
  }

  // Getter pour filtrer les catégories
  get filteredCategories() {
    if (!this.searchTerm.trim()) {
      return this.categories;
    }
    return this.categories.filter(c =>
      c.categoryName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  
  // Ajouter une catégorie par défaut
  addCategory() {
    const newId = Math.max(...this.allCategories.map(c => c.id), 0) + 1;
    const newCategory: Category = {
      id: newId,
      categoryName: 'New Category',
      products: [],
      editing: true
    };
    
    // Add to allCategories first
    this.allCategories.unshift(newCategory);
    
    // Reset pagination to refresh the display and avoid duplicates
    this.resetPagination();
    this.loadMoreCategories();
  }

  // Supprimer une catégorie
  deleteCategory(category: Category) {
    const confirmed = confirm("⚠️ Voulez-vous vraiment supprimer cette catégorie ?");
    if (confirmed) {
      // Remove from displayed categories
      this.categories = this.categories.filter(c => c !== category);
      // Remove from all categories as well
      this.allCategories = this.allCategories.filter(c => c.id !== category.id);
    }
  }

  // Activer/désactiver le mode édition
  toggleEdit(category: Category) {
    category.editing = !category.editing;
    // Convert products array to string for editing if needed
    if (category.editing && Array.isArray(category.products)) {
      (category as any).productsString = category.products.join(', ');
    } else if (!category.editing && (category as any).productsString) {
      category.products = (category as any).productsString.split(',').map((p: string) => p.trim()).filter((p: string) => p);
    }
  }
}

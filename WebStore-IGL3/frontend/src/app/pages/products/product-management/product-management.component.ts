import { Component, OnInit, ViewChild, ElementRef, AfterViewInit, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductDisplay, ProductResponse, Product } from '../../../models/product.interface';
import { ProductService } from '../../../services/product.service';
import { fromEvent } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-product-management',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.css']
})
export class ProductManagementComponent implements OnInit, AfterViewInit, OnChanges {
  @ViewChild('productScroll') productScroll!: ElementRef;
  @Input() searchTerm: string = '';

  filteredProducts: ProductDisplay[] = [];
  page = 0;
  size = 12;
  isLoading = false;
  hasMoreData = true;
  searchKeyword = '';

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchTerm'] && !changes['searchTerm'].firstChange) {
      this.searchKeyword = this.searchTerm;
      this.searchProducts();
    }
  }

  ngAfterViewInit(): void {
    // Infinite scroll
    fromEvent(this.productScroll.nativeElement, 'scroll')
      .pipe(debounceTime(100))
      .subscribe(() => this.onScroll());
  }

  private onScroll(): void {
    const el = this.productScroll.nativeElement;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) {
      this.loadProducts();
    }
  }

  loadProducts(): void {
    if (!this.hasMoreData || this.isLoading) return;

    this.isLoading = true;
    console.log('🔍 Loading products - page:', this.page, 'size:', this.size);
    
    this.productService.getProducts(this.page, this.size).subscribe({
      next: (res) => {
        console.log('✅ Products API response:', res);
        console.log('📦 Products content:', res.content);
        console.log('🔢 Total elements:', res.totalElements);
        
        // Map products to ProductDisplay by adding editing property
        const productsWithEditing = res.content.map(product => ({
          ...product,
          editing: false
        }));
        this.filteredProducts.push(...productsWithEditing);
        this.page++;
        this.hasMoreData = this.page < res.totalPages;
        this.isLoading = false;
        
        console.log('📋 Current filtered products:', this.filteredProducts);
        console.log('📊 Has more data:', this.hasMoreData);
      },
      error: (err: unknown) => {
        console.error('❌ Erreur chargement produits', err);
        this.isLoading = false;
      }
    });
  }

  searchProducts(): void {
    if (!this.searchKeyword.trim()) {
      this.page = 0;
      this.filteredProducts = [];
      this.hasMoreData = true;
      this.loadProducts();
      return;
    }

    this.isLoading = true;
    console.log('🔍 Recherche par mot-clé:', this.searchKeyword);
    
    this.productService.searchProducts(this.searchKeyword.trim()).subscribe({
      next: (products: Product[]) => {
        console.log('✅ Résultats de recherche:', products);
        // Map products to ProductDisplay by adding editing property
        this.filteredProducts = products.map(product => ({
          ...product,
          editing: false
        }));
        this.hasMoreData = false;
        this.isLoading = false;
        
        if (products.length === 0) {
          console.log('📭 Aucun produit trouvé pour:', this.searchKeyword);
        }
      },
      error: (err: unknown) => {
        console.error('❌ Erreur recherche produits:', err);
        this.filteredProducts = [];
        this.isLoading = false;
      }
    });
  }

  toggleEdit(product: ProductDisplay): void {
    product.editing = !product.editing;
    if (!product.editing && product.id) {
      this.productService.patchProduct(product.id, product).subscribe({
        error: (err: unknown) => console.error('Erreur mise à jour produit', err)
      });
    }
  }

  deleteProduct(product: ProductDisplay): void {
    if (!product.id) return;
    if (!confirm(`Voulez-vous vraiment supprimer ${product.name} ?`)) return;

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.filteredProducts = this.filteredProducts.filter(p => p.id !== product.id);
      },
      error: (err: unknown) => console.error('Erreur suppression produit', err)
    });
  }

  addProduct(): void {
    this.router.navigate(['/product-mod']);
  }

  editProduct(product: ProductDisplay): void {
    if (product.id) {
      this.router.navigate(['/product-mod', product.id]);
    }
  }
}

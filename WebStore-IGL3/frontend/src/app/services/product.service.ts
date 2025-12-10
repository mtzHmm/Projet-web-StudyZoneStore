import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Product, ProductResponse, ProductCreateRequest, ProductUpdateRequest } from '../models/product.interface';
import { Category } from '../models/category.interface';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  // Direct reference to shared mock data
  private get products(): Product[] { return MOCK_PRODUCTS; }
  private nextId: number = Math.max(...MOCK_PRODUCTS.map(p => p.id)) + 1;

  constructor() {
    console.log('📦 ProductService initialized with mock data');
  }

  // Get all products with filters
  getProducts(
    page: number = 0,
    size: number = 12,
    sortBy: string = 'name',
    sortDirection: string = 'ASC',
    categoryId?: number,
    isClothing?: boolean,
    minPrice?: number,
    maxPrice?: number
  ): Observable<ProductResponse> {
    console.log('🌐 Mock getProducts request:', {
      page, size, sortBy, sortDirection, categoryId, isClothing, minPrice, maxPrice
    });

    return of(null).pipe(
      delay(300), // Simulate network delay
      map(() => this.filterAndPaginateProducts(page, size, sortBy, sortDirection, {
        categoryId,
        isClothing,
        minPrice,
        maxPrice
      }))
    );
  }

  // Get products with all filters (unified method)
  getProductsWithAllFilters(
    page: number = 0,
    size: number = 12,
    sortBy: string = 'name',
    sortDirection: string = 'ASC',
    filters: {
      searchQuery?: string;
      categoryId?: number;
      isClothing?: boolean;
      minPrice?: number;
      maxPrice?: number;
      showFavoritesOnly?: boolean;
      favoriteIds?: number[];
    } = {}
  ): Observable<ProductResponse> {
    console.log('🔄 Mock unified request with filters:', {
      page, size, sortBy, sortDirection, filters
    });

    return of(null).pipe(
      delay(300), // Simulate network delay
      map(() => {
        let filtered = [...MOCK_PRODUCTS];

        // Apply search filter
        if (filters.searchQuery) {
          filtered = filtered.filter(p =>
            p.name.toLowerCase().includes(filters.searchQuery!.toLowerCase()) ||
            p.description?.toLowerCase().includes(filters.searchQuery!.toLowerCase())
          );
        }

        // Apply category filter
        if (filters.categoryId !== undefined) {
          filtered = filtered.filter(p => p.category?.id === filters.categoryId);
        }

        // Apply clothing filter
        if (filters.isClothing !== undefined) {
          filtered = filtered.filter(p => p.isClothing === filters.isClothing);
        }

        // Apply price filters
        if (filters.minPrice !== undefined && filters.minPrice !== null) {
          filtered = filtered.filter(p => p.price >= filters.minPrice!);
        }
        if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
          filtered = filtered.filter(p => p.price <= filters.maxPrice!);
        }

        // Apply favorites filter
        if (filters.showFavoritesOnly && filters.favoriteIds && filters.favoriteIds.length > 0) {
          filtered = filtered.filter(p => filters.favoriteIds!.includes(p.id));
        }

        // Apply sorting
        filtered = this.sortProducts(filtered, sortBy, sortDirection);

        // Apply pagination
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);
        const start = page * size;
        const end = start + size;
        const paginatedProducts = filtered.slice(start, end);

        return {
          content: paginatedProducts,
          totalElements,
          totalPages,
          size,
          number: page,
          first: page === 0,
          last: page >= (totalPages - 1)
        } as ProductResponse;
      })
    );
  }

  // Get product by ID
  getProductById(id: number): Observable<Product> {
    const product = MOCK_PRODUCTS.find(p => p.id === id);
    
    if (!product) {
      return of({} as Product).pipe(delay(300));
    }

    return of(product).pipe(delay(300));
  }

  // Search products by keyword
  searchProducts(query: string): Observable<Product[]> {
    const lowerQuery = query.toLowerCase();
    const results = this.products.filter(p =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description?.toLowerCase().includes(lowerQuery)
    );

    return of(results).pipe(delay(300));
  }

  // Create product
  createProduct(product: ProductCreateRequest): Observable<Product> {
    const newProduct: Product = {
      name: product.name || 'Unnamed Product',
      description: product.description || '',
      price: product.price || 0,
      stock: product.stock || 0,
      isClothing: product.isClothing || false,
      ...product,
      id: this.nextId++,
      imageUrl: product.imageUrl || '/assets/images/placeholder.jpg'
    };

    MOCK_PRODUCTS.push(newProduct);
    console.log('✅ Product created:', newProduct);

    return of(newProduct).pipe(delay(500));
  }

  // Update product
  updateProduct(id: number, product: ProductUpdateRequest): Observable<Product> {
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    
    if (index === -1) {
      return of({} as Product).pipe(delay(300));
    }

    const updatedProduct = { ...MOCK_PRODUCTS[index], ...product };
    MOCK_PRODUCTS[index] = updatedProduct;
    console.log('✅ Product updated:', updatedProduct);

    return of(updatedProduct).pipe(delay(500));
  }

  // Patch product
  patchProduct(id: number, updates: Partial<Product>): Observable<Product> {
    const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
    
    if (index === -1) {
      return of({} as Product).pipe(delay(300));
    }

    const patchedProduct = { ...MOCK_PRODUCTS[index], ...updates };
    MOCK_PRODUCTS[index] = patchedProduct;
    console.log('✅ Product patched:', patchedProduct);

    return of(patchedProduct).pipe(delay(500));
  }

  // Delete product
  deleteProduct(id: number): Observable<any> {
    const index = this.products.findIndex(p => p.id === id);
    
    if (index !== -1) {
      MOCK_PRODUCTS.splice(index, 1);
      console.log('✅ Product deleted with ID:', id);
    }

    return of({ success: true }).pipe(delay(300));
  }

  // Upload product image (mock)
  uploadProductImage(file: File): Observable<any> {
    const filename = file.name;
    return of({
      success: true,
      imageUrl: `/assets/images/${filename}`,
      filename
    }).pipe(delay(500));
  }

  // Delete product image (mock)
  deleteProductImage(imageUrl: string): Observable<any> {
    return of({ success: true }).pipe(delay(300));
  }

  // Get next product reference
  getNextReference(): Observable<{ reference: string }> {
    const maxRef = MOCK_PRODUCTS
      .map(p => parseInt(p.reference?.split('-')[1] || '0'))
      .reduce((a, b) => Math.max(a, b), 0);
    
    const nextRef = `PRODUCT-${String(maxRef + 1).padStart(3, '0')}`;
    return of({ reference: nextRef }).pipe(delay(200));
  }

  // Get categories
  getCategories(): Observable<Category[]> {
    return of(MOCK_CATEGORIES).pipe(delay(300));
  }

  // ==================== HELPER METHODS ====================

  private filterAndPaginateProducts(
    page: number,
    size: number,
    sortBy: string,
    sortDirection: string,
    filters: any
  ): ProductResponse {
    let filtered = [...MOCK_PRODUCTS];

    // Apply category filter
    if (filters.categoryId !== undefined) {
      filtered = filtered.filter(p => p.category?.id === filters.categoryId);
    }

    // Apply clothing filter
    if (filters.isClothing !== undefined) {
      filtered = filtered.filter(p => p.isClothing === filters.isClothing);
    }

    // Apply price filters
    if (filters.minPrice !== undefined && filters.minPrice !== null) {
      filtered = filtered.filter(p => p.price >= filters.minPrice);
    }
    if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
      filtered = filtered.filter(p => p.price <= filters.maxPrice);
    }

    // Apply sorting
    filtered = this.sortProducts(filtered, sortBy, sortDirection);

    // Apply pagination
    const totalElements = filtered.length;
    const totalPages = Math.ceil(totalElements / size);
    const start = page * size;
    const end = start + size;
    const paginatedProducts = filtered.slice(start, end);

    return {
      content: paginatedProducts,
      totalElements,
      totalPages,
      size,
      number: page,
      first: page === 0,
      last: page >= (totalPages - 1)
    };
  }

  private sortProducts(products: Product[], sortBy: string, sortDirection: string): Product[] {
    const sorted = [...products];
    const direction = sortDirection.toUpperCase() === 'ASC' ? 1 : -1;

    sorted.sort((a, b) => {
      let aVal: any = (a as any)[sortBy];
      let bVal: any = (b as any)[sortBy];

      if (typeof aVal === 'string') {
        return aVal.localeCompare(bVal) * direction;
      }
      return (aVal - bVal) * direction;
    });

    return sorted;
  }

  getCorrectImageUrl(product: Product): string {
    return product.imageUrl || '/assets/images/placeholder.jpg';
  }
}

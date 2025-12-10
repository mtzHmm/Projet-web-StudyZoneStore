import { Component, OnInit, OnDestroy, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product.interface';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-details',
  imports: [CommonModule],
  templateUrl: './details.component.html',
  styleUrl: './details.component.css'
})
export class Details implements OnInit, OnDestroy {
  product: Product | null = null;
  selectedSize: string = '';
  sizes: string[] = ['XS', 'S', 'M', 'L', 'XL'];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    // Hide footer
    const footer = this.document.querySelector('app-footer');
    if (footer) {
      this.renderer.setStyle(footer, 'display', 'none');
    }

    // Disable scroll on body
    this.renderer.setStyle(this.document.body, 'overflow', 'hidden');
    this.renderer.setStyle(this.document.documentElement, 'overflow', 'hidden');

    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.loadProduct(+productId);
    }
  }

  ngOnDestroy() {
    // Show footer again when leaving this component
    const footer = this.document.querySelector('app-footer');
    if (footer) {
      this.renderer.removeStyle(footer, 'display');
    }

    // Re-enable scroll on body
    this.renderer.removeStyle(this.document.body, 'overflow');
    this.renderer.removeStyle(this.document.documentElement, 'overflow');
  }

  loadProduct(id: number) {
    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.product = product;
      },
      error: (error) => {
        console.error('Error loading product:', error);
        // Fallback with mock data for demonstration - determine clothing based on ID or name
        if (id === 1) {
          // Product ID 1 appears to be "stylo" (pen) - not clothing
          this.product = {
            id: id,
            name: 'stylo',
            price: 5,
            description: 'High-quality pen for writing',
            stock: 100,
            isClothing: false,
            imageUrl: '/assets/stylo.svg'
          };
        } else {
          // Default to clothing for other IDs
          this.product = {
            id: id,
            name: 'SWEAT-SHIRT SPECIAL',
            price: 45,
            description: 'Special StudyZone Store sweatshirt',
            stock: 10,
            isClothing: true,
            imageUrl: '/assets/hoodie.svg'
          };
        }
      }
    });
  }

  selectSize(size: string) {
    this.selectedSize = size;
  }

  isNonClothingProduct(): boolean {
    if (!this.product?.name) return false;
    
    const productName = this.product.name.toLowerCase();
    const nonClothingItems = [
      'stylo', 'pen', 'pencil', 'crayon',
      'book', 'livre', 'notebook', 'cahier',
      'accessory', 'accessoire', 'gadget',
      'electronic', 'électronique',
      'tool', 'outil', 'device'
    ];
    
    return nonClothingItems.some(item => productName.includes(item));
  }

  addToCart() {
    if (!this.product) {
      this.notificationService.error('Product not found');
      return;
    }
    
    const isActuallyClothing = this.product.isClothing && !this.isNonClothingProduct();
    
    // For clothing items, require size selection
    if (this.product.isClothing && !this.selectedSize) {
      this.notificationService.warning('Please select a size');
      return;
    }
    
    // Use guest user ID (no authentication)
    const userId = 0;
    
    console.log('🛒 Adding to cart - User ID:', userId, 'Product ID:', this.product.id, 'Quantity:', 1);
    
    // Add to cart via API (works for both guests and authenticated users)
    this.cartService.addToCart(userId, this.product.id!, 1).subscribe({
      next: (cartItem) => {
        console.log('Product added to cart:', cartItem);
        if (this.product!.isClothing) {
          this.notificationService.success(
            `${this.product!.name} added to cart!`,
            `Size: ${this.selectedSize}`,
            5000
          );
        } else {
          this.notificationService.success(
            `${this.product!.name} added to cart!`,
            undefined,
            5000
          );
        }
      },
      error: (error) => {
        console.error('Error adding to cart:', error);
        this.notificationService.error(
          'Error adding to cart',
          'Please try again later'
        );
      }
    });
  }

  backToShop() {
    this.router.navigate(['/shop']);
  }
}

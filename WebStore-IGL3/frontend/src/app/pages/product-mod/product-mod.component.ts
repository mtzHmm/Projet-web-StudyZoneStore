import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Product, ProductUpdateRequest } from '../../models/product.interface';
import { CategoryService, Category } from '../../services/category.service';
import { ImageCropperComponent } from '../../components/image-cropper/image-cropper.component';

@Component({
  selector: 'app-product-mod',
  imports: [CommonModule, FormsModule, ImageCropperComponent],
  templateUrl: './product-mod.component.html',
  styleUrl: './product-mod.component.css'
})
export class ProductMod implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild(ImageCropperComponent) imageCropper!: ImageCropperComponent;

  // Product ID from route
  productId: number | null = null;
  isEditMode: boolean = false;
  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // Product properties
  productReference: string = '';
  productMaterial: string = '';
  productPrintings: string = '';
  productCategory: string = '';
  productCategoryId: number | null = null;
  productPrice: number = 0;
  productName: string = '';
  productStock: number = 0;
  productDescription: string = '';
  isClothing: boolean = false;

  // Categories
  categories: Category[] = [];
  newCategoryName: string = '';
  isAddingCategory: boolean = false;
  
  // Pagination for categories
  currentPage: number = 1;
  itemsPerPage: number = 5;
  totalCategories: number = 0;
  paginatedCategories: Category[] = [];
  
  // Delete confirmation
  showDeleteConfirmation: boolean = false;
  categoryToDelete: Category | null = null;
  productsToDelete: any[] = [];

  // Image properties
  selectedImage: string = '';
  selectedImageIndex: number = 0;
  productImages: string[] = [];
  recropIndex: number = -1; // Track which image is being recropped

  // Size properties
  availableSizes: string[] = ['XS', 'S', 'M', 'L', 'XL'];
  selectedSizes: string[] = [];

  // Math object for template
  Math = Math;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    console.log('🏗️ ProductMod component constructor - CategoryService injecté:', !!this.categoryService);
  }

  ngOnInit(): void {
    // Charger les catégories
    this.loadCategories();
    
    // Récupérer l'ID du produit depuis la route
    this.route.params.subscribe(params => {
      const id = params['id'];
      if (id && !isNaN(+id)) {
        this.productId = +id;
        this.isEditMode = true;
        this.loadProduct();
      } else {
        // Mode création - pas d'ID ou ID invalide
        this.productId = null;
        this.isEditMode = false;
        this.setDefaultValues();
        // Générer automatiquement la prochaine référence
        this.loadNextReference();
      }
    });
  }

  private setDefaultValues(): void {
    this.productReference = '';
    this.productMaterial = 'coton';
    this.productPrintings = '';
    this.productCategory = '';
    this.productCategoryId = null;
    this.productPrice = 0;
    this.productName = '';
    this.productStock = 0;
    this.productDescription = '';
    this.isClothing = false;
    this.selectedSizes = [];
    this.productImages = [];
  }

  private loadProduct(): void {
    if (!this.productId) return;

    this.isLoading = true;
    this.productService.getProductById(this.productId).subscribe({
      next: (product: Product) => {
        this.populateForm(product);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement du produit:', error);
        this.errorMessage = 'Erreur lors du chargement du produit';
        this.isLoading = false;
      }
    });
  }

  private loadNextReference(): void {
    console.log('🔢 Chargement de la prochaine référence...');
    this.productService.getNextReference().subscribe({
      next: (response) => {
        this.productReference = response.reference;
        console.log('✅ Prochaine référence générée:', this.productReference);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la génération de la référence:', error);
        // En cas d'erreur, utiliser une référence par défaut
        this.productReference = 'REF0001';
      }
    });
  }

  private loadCategories(): void {
    console.log('🔄 Début du chargement des catégories...');
    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        this.categories = categories;
        console.log('✅ Catégories chargées avec succès:', categories);
        console.log('📊 Nombre de catégories:', categories.length);
        
        if (categories.length === 0) {
          console.warn('⚠️ Aucune catégorie trouvée dans la base de données');
          this.loadFallbackCategories();
        } else {
          this.updatePagination();
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des catégories:', error);
        console.error('📋 Détails de l\'erreur:', {
          message: error.message,
          status: error.status,
          url: error.url
        });
        this.errorMessage = `Erreur lors du chargement des catégories: ${error.message || 'Erreur inconnue'}`;
        
        // Utiliser des catégories par défaut en cas d'erreur
        this.loadFallbackCategories();
      }
    });
  }

  private loadFallbackCategories(): void {
    console.log('🔄 Chargement des catégories par défaut...');
    this.categories = [
      { id: 1, name: 'T-shirt' },
      { id: 2, name: 'Hoodie' },
      { id: 3, name: 'Accessories' },
      { id: 4, name: 'Chleka' },
      { id: 5, name: 'Sweatshirt' },
      { id: 6, name: 'Jacket' },
      { id: 7, name: 'Polo' },
      { id: 8, name: 'Tank Top' },
      { id: 9, name: 'Jeans' },
      { id: 10, name: 'Shorts' },
      { id: 11, name: 'Sneakers' },
      { id: 12, name: 'Caps' }
    ];
    console.log('✅ Catégories par défaut chargées:', this.categories);
    this.updatePagination();
  }

  // Pagination methods
  private updatePagination(): void {
    this.totalCategories = this.categories.length;
    this.updatePaginatedCategories();
  }

  private updatePaginatedCategories(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.paginatedCategories = this.categories.slice(startIndex, endIndex);
  }

  get totalPages(): number {
    return Math.ceil(this.totalCategories / this.itemsPerPage);
  }

  get pages(): number[] {
    const pagesArray = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pagesArray.push(i);
    }
    return pagesArray;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePaginatedCategories();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedCategories();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedCategories();
    }
  }

  // Message handling
  showSuccessMessage(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';
    
    // Masquer le message après 5 secondes
    setTimeout(() => {
      this.successMessage = '';
    }, 5000);
  }

  clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  private populateForm(product: Product): void {
    this.productName = product.name;
    this.productDescription = product.description || '';
    this.productPrice = product.price;
    this.productStock = product.stock;
    this.isClothing = product.isClothing;
    this.productCategory = product.category?.name || '';
    this.productCategoryId = product.category?.id || null;
    
    // Propriétés étendues
    this.productReference = product.reference || '';
    this.productMaterial = product.material || '';
    this.productPrintings = product.printings || '';
    this.selectedSizes = product.availableSizes || [];
    
    // Charger imageUrl dans productImages (conversion de l'ancien format)
    if (product.imageUrl) {
      this.productImages = [product.imageUrl];
      this.selectedImage = product.imageUrl;
      this.selectedImageIndex = 0;
    } else {
      this.productImages = [];
      this.selectedImage = '';
    }
    
    // Update clothing status based on category to ensure consistency
    this.updateClothingStatus();
  }

  // Image methods
  selectImage(index: number): void {
    console.log('Image sélectionnée:', index, this.productImages[index]);
    this.selectedImageIndex = index;
    this.selectedImage = this.productImages[index];
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Vérifier que c'est bien une image
      if (file.type.startsWith('image/')) {
        // Ouvrir le cropper au lieu d'uploader directement
        this.imageCropper.openCropper(file);
      } else {
        this.errorMessage = 'Veuillez sélectionner un fichier image valide.';
      }
    }
  }

  onImageCropped(dataUrl: string): void {
    // Convertir le data URL en Blob puis en File
    fetch(dataUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], `cropped-${Date.now()}.png`, { type: 'image/png' });
        
        // If recropping an existing image, replace it
        if (this.recropIndex >= 0) {
          this.isLoading = true;
          this.productService.uploadProductImage(file).subscribe({
            next: (response) => {
              // Replace the image at the recrop index
              this.productImages[this.recropIndex] = response.imageUrl;
              
              // Update selected image if it was the one being recropped
              if (this.selectedImageIndex === this.recropIndex) {
                this.selectedImage = response.imageUrl;
              }
              
              this.recropIndex = -1; // Reset
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error uploading recropped image:', error);
              this.errorMessage = 'Error uploading recropped image';
              this.recropIndex = -1;
              this.isLoading = false;
            }
          });
        } else {
          // New image upload
          this.uploadImage(file);
        }
      })
      .catch(error => {
        console.error('Error converting image:', error);
        this.errorMessage = 'Error processing image';
        this.recropIndex = -1;
      });
  }

  onCropCancelled(): void {
    // Just reset the recrop index, don't delete anything
    this.recropIndex = -1;
  }

  recropImage(index: number): void {
    if (index >= 0 && index < this.productImages.length) {
      const imageUrl = this.productImages[index];
      
      // Store the index for potential replacement after cropping
      this.recropIndex = index;
      
      // Open the cropper with the existing image URL (don't remove it yet)
      this.imageCropper.openCropperFromUrl(imageUrl);
    }
  }

  private uploadImage(file: File): void {
    this.isLoading = true;
    this.productService.uploadProductImage(file).subscribe({
      next: (response) => {
        const imageUrl = response.imageUrl;
        
        // Ajouter la nouvelle image à la liste
        this.productImages.push(imageUrl);
        
        // Sélectionner automatiquement la nouvelle image
        this.selectedImageIndex = this.productImages.length - 1;
        this.selectedImage = imageUrl;
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur lors de l\'upload:', error);
        this.errorMessage = 'Erreur lors de l\'upload de l\'image';
        this.isLoading = false;
        
        // Fallback: utiliser FileReader pour l'aperçu local
        const reader = new FileReader();
        reader.onload = (e) => {
          const imageDataUrl = e.target?.result as string;
          this.productImages.push(imageDataUrl);
          this.selectedImageIndex = this.productImages.length - 1;
          this.selectedImage = imageDataUrl;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  removeImage(index: number): void {
    if (index >= 0 && index < this.productImages.length) {
      const imageUrl = this.productImages[index];
      
      // Si c'est une URL du serveur, tenter de la supprimer
      if (imageUrl.startsWith('/uploads/')) {
        this.productService.deleteProductImage(imageUrl).subscribe({
          next: () => {
            console.log('Image supprimée du serveur');
          },
          error: (error) => {
            console.error('Erreur lors de la suppression:', error);
          }
        });
      }
      
      // Supprimer de la liste locale
      this.productImages.splice(index, 1);
      
      // Ajuster la sélection
      if (this.selectedImageIndex >= this.productImages.length) {
        this.selectedImageIndex = Math.max(0, this.productImages.length - 1);
      }
      
      if (this.productImages.length > 0) {
        this.selectedImage = this.productImages[this.selectedImageIndex];
      } else {
        this.selectedImage = '';
      }
    }
  }

  addNewImage(): void {
    // Cette méthode n'est plus utilisée, mais gardée pour compatibilité
    this.triggerFileInput();
  }

  // Size methods
  toggleSize(size: string): void {
    const index = this.selectedSizes.indexOf(size);
    if (index > -1) {
      this.selectedSizes.splice(index, 1);
    } else {
      this.selectedSizes.push(size);
    }
  }

  // Category methods
  onCategoryChange(categoryId: string): void {
    const id = parseInt(categoryId, 10);
    this.productCategoryId = isNaN(id) ? null : id;
    
    // Mettre à jour le nom de la catégorie pour l'affichage
    const selectedCategory = this.categories.find(cat => cat.id === this.productCategoryId);
    this.productCategory = selectedCategory ? selectedCategory.name : '';
    
    // Déterminer si la catégorie est liée aux vêtements
    this.updateClothingStatus();
  }

  private updateClothingStatus(): void {
    // Liste des catégories qui ne sont PAS des vêtements
    const nonClothingCategories = [
      'accessories', 'accessoires', 'accessory',
      'electronics', 'électronique', 'electronic',
      'gadgets', 'gadget', 'device', 'devices',
      'books', 'livre', 'livres', 'book',
      'tools', 'outils', 'tool', 'outil',
      'home', 'maison', 'decoration', 'décoration',
      'sports', 'sport', 'fitness',
      'beauty', 'beauté', 'cosmetics', 'cosmétique',
      'food', 'nourriture', 'alimentation',
      'toys', 'jouets', 'toy', 'jouet',
      'stationery', 'papeterie', 'office', 'bureau'
    ];
    
    // Liste des catégories considérées comme vêtements
    const clothingCategories = [
      'clothing', 'clothes', 'vêtements', 'vetements',
      'shirt', 'chemise', 'tshirt', 't-shirt', 't shirt',
      'hoodie', 'sweat', 'pull', 'pullover',
      'pants', 'pantalon', 'jeans', 'trousers',
      'dress', 'robe', 'skirt', 'jupe',
      'jacket', 'veste', 'coat', 'manteau',
      'shoes', 'chaussures', 'sneakers', 'boots',
      'socks', 'chaussettes', 'underwear', 'sous-vêtements'
    ];
    
    if (this.productCategory) {
      const categoryLower = this.productCategory.toLowerCase();
      
      // D'abord vérifier si c'est explicitement non-vêtement
      const isNonClothing = nonClothingCategories.some(nonClothingCat => 
        categoryLower.includes(nonClothingCat)
      );
      
      if (isNonClothing) {
        this.isClothing = false;
      } else {
        // Sinon vérifier si c'est un vêtement
        this.isClothing = clothingCategories.some(clothingCat => 
          categoryLower.includes(clothingCat)
        );
      }
    } else {
      this.isClothing = false;
    }
    
    // Si ce n'est pas un vêtement, vider les tailles sélectionnées
    if (!this.isClothing) {
      this.selectedSizes = [];
    }
  }

  showAddCategoryInput(): void {
    this.isAddingCategory = true;
    this.newCategoryName = '';
  }

  cancelAddCategory(): void {
    this.isAddingCategory = false;
    this.newCategoryName = '';
  }

  addNewCategory(): void {
    if (!this.newCategoryName.trim()) {
      this.errorMessage = 'Veuillez entrer un nom de catégorie';
      return;
    }

    // Vérifier si la catégorie existe déjà
    const existingCategory = this.categories.find(cat => 
      cat.name.toLowerCase() === this.newCategoryName.trim().toLowerCase()
    );
    
    if (existingCategory) {
      this.errorMessage = 'Cette catégorie existe déjà';
      return;
    }

    console.log('🔄 Création de la nouvelle catégorie:', this.newCategoryName);
    
    const newCategory = {
      name: this.newCategoryName.trim()
    };

    this.categoryService.createCategory(newCategory).subscribe({
      next: (createdCategory: Category) => {
        console.log('✅ Nouvelle catégorie créée:', createdCategory);
        
        // Reload categories from service to ensure consistency and avoid duplicates
        this.loadCategories();
        
        // Sélectionner automatiquement la nouvelle catégorie
        this.productCategoryId = createdCategory.id;
        this.productCategory = createdCategory.name;
        
        // Réinitialiser l'interface
        this.isAddingCategory = false;
        this.newCategoryName = '';
        this.errorMessage = '';
      },
      error: (error) => {
        console.error('❌ Erreur lors de la création de la catégorie:', error);
        this.errorMessage = `Erreur lors de la création de la catégorie: ${error.error?.message || error.message || 'Erreur inconnue'}`;
      }
    });
  }

  // Delete category methods
  confirmDeleteCategory(category: Category, event: Event): void {
    event.stopPropagation(); // Empêcher la sélection de la catégorie
    
    console.log('🗑️ Demande de suppression de la catégorie:', category);
    this.categoryToDelete = category;
    
    // Récupérer les produits de cette catégorie
    this.loadProductsForCategory(category.id);
  }

  private loadProductsForCategory(categoryId: number): void {
    console.log('🔍 Chargement des produits pour la catégorie ID:', categoryId);
    console.log('🔍 Catégorie à supprimer:', this.categoryToDelete);
    
    // Utiliser le service de produits pour récupérer les produits de cette catégorie
    this.productService.getProducts(0, 1000, 'name', 'asc', categoryId).subscribe({
      next: (response) => {
        this.productsToDelete = response.content || [];
        console.log('📦 Réponse complète du service:', response);
        console.log('📦 Produits trouvés pour suppression (count):', this.productsToDelete.length);
        console.log('📦 Détails des produits trouvés:', this.productsToDelete.map(p => ({ 
          id: p.id, 
          name: p.name, 
          categoryId: p.category?.id, 
          categoryName: p.category?.name 
        })));
        
        // Vérifier que les produits appartiennent vraiment à cette catégorie
        const actualMatchingProducts = this.productsToDelete.filter(p => p.category?.id === categoryId);
        console.log('📦 Produits réellement dans cette catégorie:', actualMatchingProducts.length);
        
        // Utiliser seulement les produits qui appartiennent vraiment à cette catégorie
        this.productsToDelete = actualMatchingProducts;
        
        this.showDeleteConfirmation = true;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des produits:', error);
        // Même en cas d'erreur, on permet la suppression
        this.productsToDelete = [];
        this.showDeleteConfirmation = true;
      }
    });
  }

  cancelDeleteCategory(): void {
    this.showDeleteConfirmation = false;
    this.categoryToDelete = null;
    this.productsToDelete = [];
  }

  executeDeleteCategory(): void {
    if (!this.categoryToDelete) return;

    console.log('🗑️ Suppression de la catégorie:', this.categoryToDelete);
    console.log('📦 Produits qui seront supprimés:', this.productsToDelete);

    this.categoryService.deleteCategory(this.categoryToDelete.id).subscribe({
      next: (response: any) => {
        console.log('✅ Catégorie supprimée avec succès:', response);
        
        // Retirer la catégorie de la liste locale
        this.categories = this.categories.filter(cat => cat.id !== this.categoryToDelete?.id);
        
        // Mettre à jour la pagination
        this.updatePagination();
        
        // Ajuster la page courante si nécessaire
        if (this.currentPage > this.totalPages && this.totalPages > 0) {
          this.currentPage = this.totalPages;
          this.updatePaginatedCategories();
        }
        
        // Si la catégorie supprimée était sélectionnée, désélectionner
        if (this.categoryToDelete && this.productCategoryId === this.categoryToDelete.id) {
          this.productCategoryId = null;
          this.productCategory = '';
        }
        
        // Fermer la modal
        this.cancelDeleteCategory();
        
        // Message de succès avec détails
        this.errorMessage = '';
        
        // Afficher un message de succès temporaire
        if (response && response.message) {
          console.log('📝 Message du serveur:', response.message);
          
          // Optionnel: afficher une notification temporaire
          this.showSuccessMessage(response.message);
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors de la suppression:', error);
        this.errorMessage = `Erreur lors de la suppression: ${error.error?.message || error.message || 'Erreur inconnue'}`;
        this.cancelDeleteCategory();
      }
    });
  }

  // Action methods
  goBackToProduct(): void {
    this.router.navigate(['/products']);
  }

  saveProduct(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Utiliser la première image comme imageUrl (compatible avec la base de données)
    const imageUrl = this.productImages.length > 0 ? this.productImages[0] : undefined;

    if (this.isEditMode && this.productId) {
      // Mode modification
      const updateRequest: ProductUpdateRequest = {
        id: this.productId,
        name: this.productName,
        description: this.productDescription,
        price: this.productPrice,
        stock: this.productStock,
        isClothing: this.isClothing,
        category: this.productCategoryId ? { id: this.productCategoryId, name: this.productCategory } : undefined,
        reference: this.productReference,
        material: this.productMaterial,
        printings: this.productPrintings,
        availableSizes: this.selectedSizes,
        imageUrl: imageUrl // Utiliser imageUrl au lieu de images
      };

      this.productService.updateProduct(this.productId, updateRequest).subscribe({
        next: (product: Product) => {
          console.log('Produit mis à jour:', product);
          this.isLoading = false;
          this.goBackToProduct();
        },
        error: (error) => {
          console.error('Erreur lors de la mise à jour:', error);
          this.errorMessage = this.getErrorMessage(error);
          this.isLoading = false;
        }
      });
    } else {
      // Mode création
      const createRequest = {
        name: this.productName,
        description: this.productDescription,
        price: this.productPrice,
        stock: this.productStock,
        isClothing: this.isClothing,
        category: this.productCategoryId ? { id: this.productCategoryId, name: this.productCategory } : undefined,
        reference: this.productReference,
        material: this.productMaterial,
        printings: this.productPrintings,
        availableSizes: this.selectedSizes,
        imageUrl: imageUrl // Utiliser imageUrl au lieu de images
      };

      this.productService.createProduct(createRequest).subscribe({
        next: (product: Product) => {
          console.log('Produit créé:', product);
          this.isLoading = false;
          this.goBackToProduct();
        },
        error: (error) => {
          console.error('Erreur lors de la création:', error);
          this.errorMessage = this.getErrorMessage(error);
          this.isLoading = false;
        }
      });
    }
  }

  deleteProduct(): void {
    if (!this.productId) return;

    const confirmDelete = confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.');
    if (confirmDelete) {
      this.isLoading = true;
      this.productService.deleteProduct(this.productId).subscribe({
        next: () => {
          console.log('Produit supprimé');
          this.isLoading = false;
          this.goBackToProduct();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.errorMessage = 'Erreur lors de la suppression du produit';
          this.isLoading = false;
        }
      });
    }
  }

  private validateForm(): boolean {
    if (!this.productName.trim()) {
      this.errorMessage = 'Le nom du produit est obligatoire';
      return false;
    }
    if (this.productPrice <= 0) {
      this.errorMessage = 'Le prix doit être supérieur à 0';
      return false;
    }
    if (this.productStock < 0) {
      this.errorMessage = 'Le stock ne peut pas être négatif';
      return false;
    }
    if (!this.productCategoryId) {
      this.errorMessage = 'Veuillez sélectionner une catégorie';
      return false;
    }
    return true;
  }

  private getErrorMessage(error: any): string {
    if (error.status === 0) {
      return 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré sur le port 8080.';
    }
    if (error.status === 404) {
      return 'Endpoint non trouvé. Vérifiez la configuration du backend.';
    }
    if (error.status === 400) {
      return 'Données invalides: ' + (error.error?.message || 'Vérifiez les champs du formulaire');
    }
    if (error.status === 500) {
      return 'Erreur interne du serveur. Vérifiez les logs du backend.';
    }
    if (error.error?.message) {
      return error.error.message;
    }
    return 'Erreur de connexion. Assurez-vous que le backend Spring Boot est démarré sur localhost:8080';
  }
}

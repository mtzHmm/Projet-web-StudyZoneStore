import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { MOCK_CATEGORIES } from './mock-data';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // Direct reference to centralized category data
  private get categories(): Category[] { return MOCK_CATEGORIES; }
  private nextId: number = Math.max(...MOCK_CATEGORIES.map(c => c.id)) + 1;
  
  // Subject pour la gestion d'état des catégories
  private categoriesSubject = new BehaviorSubject<Category[]>(MOCK_CATEGORIES);
  public categories$ = this.categoriesSubject.asObservable();

  constructor() {
    console.log('📂 CategoryService initialized with mock data');
    this.loadCategories();
  }

  /**
   * Récupère toutes les catégories
   */
  getCategories(): Observable<Category[]> {
    return of(MOCK_CATEGORIES).pipe(
      delay(300),
      map(categories => {
        this.categoriesSubject.next(categories);
        return categories;
      })
    );
  }

  /**
   * Récupère une catégorie par son ID
   */
  getCategoryById(id: number): Observable<Category> {
    const category = MOCK_CATEGORIES.find(c => c.id === id);
    return of(category || ({} as Category)).pipe(delay(300));
  }

  /**
   * Crée une nouvelle catégorie (Admin)
   */
  createCategory(category: Omit<Category, 'id'>): Observable<Category> {
    const newCategory: Category = {
      ...category,
      id: this.nextId++
    };

    MOCK_CATEGORIES.push(newCategory);
    this.categoriesSubject.next([...MOCK_CATEGORIES]);
    console.log('✅ Category created:', newCategory);

    return of(newCategory).pipe(delay(500));
  }

  /**
   * Met à jour une catégorie existante (Admin)
   */
  updateCategory(id: number, category: Partial<Category>): Observable<Category> {
    const index = this.categories.findIndex(c => c.id === id);
    
    if (index === -1) {
      return of({} as Category).pipe(delay(300));
    }

    const updatedCategory = { ...MOCK_CATEGORIES[index], ...category };
    MOCK_CATEGORIES[index] = updatedCategory;
    this.categoriesSubject.next([...MOCK_CATEGORIES]);
    console.log('✅ Category updated:', updatedCategory);

    return of(updatedCategory).pipe(delay(500));
  }

  /**
   * Supprime une catégorie (Admin)
   */
  deleteCategory(id: number): Observable<{ message: string }> {
    const index = MOCK_CATEGORIES.findIndex(c => c.id === id);
    
    if (index !== -1) {
      MOCK_CATEGORIES.splice(index, 1);
      this.categoriesSubject.next([...MOCK_CATEGORIES]);
      console.log('✅ Category deleted with ID:', id);
    }

    return of({ message: 'Category deleted successfully' }).pipe(delay(300));
  }

  /**
   * Charge les catégories au démarrage
   */
  private loadCategories(): void {
    this.getCategories().subscribe({
      next: (categories) => {
        console.log('Catégories chargées:', categories);
      },
      error: (error) => console.error('Erreur lors du chargement initial des catégories:', error)
    });
  }

  /**
   * Obtient les catégories actuellement en cache
   */
  getCurrentCategories(): Category[] {
    return MOCK_CATEGORIES;
  }

  /**
   * Actualise les catégories depuis le serveur
   */
  refreshCategories(): Observable<Category[]> {
    return this.getCategories();
  }
}
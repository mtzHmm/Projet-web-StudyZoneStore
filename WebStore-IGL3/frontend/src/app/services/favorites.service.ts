import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { AuthService, User } from './auth.service';
import { STORAGE_KEYS } from './mock-data';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = STORAGE_KEYS.FAVORITES;
  private favoritesSubject = new BehaviorSubject<number[]>([]);

  constructor(
    private authService: AuthService
  ) {
    console.log('⭐ FavoritesService initialized with localStorage');
    this.initializeFavorites();
  }

  /**
   * Initialize favorites according to login state
   */
  private initializeFavorites(): void {
    const user = this.authService.getCurrentUser();
    
    if (user?.id) {
      console.log('👤 User logged in, loading favorites from localStorage for user:', user.id);
      this.loadFavoritesFromStorage(user.id);
    } else {
      console.log('👤 User not logged in, loading global favorites from localStorage');
      this.favoritesSubject.next(this.loadFromStorage());
    }

    // Listen for authentication changes
    this.authService.currentUser$.subscribe(newUser => {
      if (newUser?.id) {
        console.log('🔄 Login detected, switching to user-specific favorites');
        this.loadFavoritesFromStorage(newUser.id);
      } else {
        console.log('🔄 Logout detected, returning to global localStorage');
        this.favoritesSubject.next(this.loadFromStorage());
      }
    });
  }

  /**
   * Load user-specific favorites from localStorage
   */
  private loadFavoritesFromStorage(userId: number): void {
    const userKey = `${this.STORAGE_KEY}_user_${userId}`;
    const userFavorites = this.loadFromStorageKey(userKey);
    
    console.log('📥 User favorites loaded from localStorage:', userFavorites);
    this.favoritesSubject.next(userFavorites);
  }

  /**
   * Get current favorites list as Observable
   */
  getFavorites(): Observable<number[]> {
    return this.favoritesSubject.asObservable();
  }

  /**
   * Get current favorites list (instant value)
   */
  getCurrentFavorites(): number[] {
    return this.favoritesSubject.value;
  }

  /**
   * Check if a product is in favorites
   */
  isFavorite(productId: number): boolean {
    return this.getCurrentFavorites().includes(productId);
  }

  /**
   * Toggle favorite state of a product
   */
  toggleFavorite(productId: number): boolean {
    const user = this.authService.getCurrentUser();
    
    if (user?.id) {
      // Logged in user → use API
      this.toggleFavoriteOnServer(user.id, productId);
      // Update local state immediately for reactive UI
      const currentFavorites = this.getCurrentFavorites();
      const isCurrentlyFavorite = currentFavorites.includes(productId);
      if (isCurrentlyFavorite) {
        this.updateLocalFavorites(currentFavorites.filter(id => id !== productId));
        return false;
      } else {
        this.updateLocalFavorites([...currentFavorites, productId]);
        return true;
      }
    } else {
      // Not logged in → localStorage only
      if (this.isFavorite(productId)) {
        this.removeFromFavoritesLocal(productId);
        return false;
      } else {
        this.addToFavoritesLocal(productId);
        return true;
      }
    }
  }

  /**
   * Toggle favorite status for a product (Observable version)
   */
  toggleFavoriteObservable(productId: number): Observable<boolean> {
    const user = this.authService.getCurrentUser();
    const isFav = this.isFavorite(productId);

    if (user?.id) {
      // User logged in - save to user-specific storage
      const userKey = `${this.STORAGE_KEY}_user_${user.id}`;
      const userFavorites = this.loadFromStorageKey(userKey);
      
      let updatedFavorites: number[];
      if (isFav) {
        updatedFavorites = userFavorites.filter(id => id !== productId);
        console.log('💔 Product removed from favorites (user):', productId);
      } else {
        updatedFavorites = [...userFavorites, productId];
        console.log('⭐ Product added to favorites (user):', productId);
      }

      this.saveToStorageKey(userKey, updatedFavorites);
      this.favoritesSubject.next(updatedFavorites);
      
      return of(!isFav).pipe(delay(300));
    } else {
      // Not logged in - save to global localStorage
      let currentFavorites = this.loadFromStorage();
      
      if (isFav) {
        currentFavorites = currentFavorites.filter(id => id !== productId);
        console.log('💔 Product removed from favorites (guest):', productId);
      } else {
        currentFavorites = [...currentFavorites, productId];
        console.log('⭐ Product added to favorites (guest):', productId);
      }

      this.saveToStorage(currentFavorites);
      this.favoritesSubject.next(currentFavorites);
      
      return of(!isFav).pipe(delay(300));
    }
  }

  /**
   * Add a product to favorites (DEPRECATED - use toggleFavorite)
   */
  addToFavorites(productId: number): void {
    if (!this.isFavorite(productId)) {
      this.toggleFavoriteObservable(productId).subscribe();
    }
  }

  /**
   * Remove a product from favorites (DEPRECATED - use toggleFavorite)
   */
  removeFromFavorites(productId: number): void {
    if (this.isFavorite(productId)) {
      this.toggleFavoriteObservable(productId).subscribe();
    }
  }

  /**
   * Get total number of favorites
   */
  getFavoritesCount(): number {
    return this.getCurrentFavorites().length;
  }

  /**
   * Clear all favorites
   */
  clearAllFavorites(): void {
    const user = this.authService.getCurrentUser();
    
    if (user?.id) {
      // Logged in user - clear user-specific favorites
      const userKey = `${this.STORAGE_KEY}_user_${user.id}`;
      localStorage.removeItem(userKey);
      console.log('🗑️ User favorites cleared');
    } else {
      // Not logged in - clear global favorites
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('🗑️ Global favorites cleared');
    }
    
    this.favoritesSubject.next([]);
  }

  /**
   * @deprecated Use clearAllFavorites() instead
   */
  clearFavorites(): void {
    this.clearAllFavorites();
  }

  /**
   * Helper method to update local favorites state
   */
  private updateLocalFavorites(favorites: number[]): void {
    this.favoritesSubject.next(favorites);
  }

  /**
   * Helper method to add to favorites locally
   */
  private addToFavoritesLocal(productId: number): void {
    const favorites = this.loadFromStorage();
    if (!favorites.includes(productId)) {
      favorites.push(productId);
      this.saveToStorage(favorites);
      this.favoritesSubject.next(favorites);
    }
  }

  /**
   * Helper method to remove from favorites locally
   */
  private removeFromFavoritesLocal(productId: number): void {
    const favorites = this.loadFromStorage();
    const updated = favorites.filter(id => id !== productId);
    this.saveToStorage(updated);
    this.favoritesSubject.next(updated);
  }

  /**
   * Helper method to toggle favorite on server
   */
  private toggleFavoriteOnServer(userId: number, productId: number): void {
    // This would be an HTTP call to your backend API
    // For now, we'll just log it
    console.log(`Toggle favorite on server for user ${userId}, product ${productId}`);
  }

  /**
   * Charger les favoris depuis le localStorage
   */
  private loadFromStorage(): number[] {
    return this.loadFromStorageKey(this.STORAGE_KEY);
  }

  /**
   * Load from specific localStorage key
   */
  private loadFromStorageKey(key: string): number[] {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      return [];
    }
  }

  /**
   * Sauvegarder dans localStorage
   */
  private saveToStorage(favorites: number[]): void {
    this.saveToStorageKey(this.STORAGE_KEY, favorites);
  }

  /**
   * Save to specific localStorage key
   */
  private saveToStorageKey(key: string, favorites: number[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(favorites));
    } catch (error) {
      console.error('Erreur sauvegarde localStorage:', error);
    }
  }

  /**
   * Obtenir les favoris filtrés par produits disponibles
   */
  getFavoritesWithProducts(products: any[]): any[] {
    const favoriteIds = this.getCurrentFavorites();
    return products.filter(product => favoriteIds.includes(product.id));
  }

  /**
   * Obtenir les statistiques des favoris (utile pour le dashboard admin plus tard)
   */
  getFavoritesStats(): { totalFavorites: number; favoritesList: number[] } {
    const favorites = this.getCurrentFavorites();
    return {
      totalFavorites: favorites.length,
      favoritesList: favorites
    };
  }

  /**
   * MÉTHODE DE DEBUG : Afficher l'état actuel
   */
  debugState(): void {
    const user = this.authService.getCurrentUser();
    const favorites = this.getCurrentFavorites();
    const localStorage = this.loadFromStorage();
    
    console.log('🔍 DEBUG STATE:');
    console.log('  - Utilisateur connecté:', user);
    console.log('  - Favoris en mémoire:', favorites);
    console.log('  - Favoris localStorage:', localStorage);
  }
}
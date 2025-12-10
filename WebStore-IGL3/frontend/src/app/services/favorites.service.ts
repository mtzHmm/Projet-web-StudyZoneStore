import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LOCAL_STORAGE_KEYS as STORAGE_KEYS } from './mock-data';

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  email: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {
  private readonly STORAGE_KEY = STORAGE_KEYS.FAVORITES;
  private favoritesSubject = new BehaviorSubject<number[]>([]);

  constructor() {
    console.log('⭐ FavoritesService initialized with localStorage - no auth required');
    this.initializeFavorites();
  }

  /**
   * Initialize favorites - no auth required, use global favorites
   */
  private initializeFavorites(): void {
    console.log('⭐ Loading global favorites from localStorage');
    this.favoritesSubject.next(this.loadFromStorage());
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
   * Toggle favorite state of a product (localStorage only)
   */
  toggleFavorite(productId: number): boolean {
    if (this.isFavorite(productId)) {
      this.removeFromFavoritesLocal(productId);
      return false;
    } else {
      this.addToFavoritesLocal(productId);
      return true;
    }
  }

  /**
   * Toggle favorite status for a product (Observable version) - localStorage only
   */
  toggleFavoriteObservable(productId: number): Observable<boolean> {
    const isFav = this.isFavorite(productId);
    let currentFavorites = this.loadFromStorage();
    
    if (isFav) {
      currentFavorites = currentFavorites.filter(id => id !== productId);
      console.log('💔 Product removed from favorites:', productId);
    } else {
      currentFavorites = [...currentFavorites, productId];
      console.log('⭐ Product added to favorites:', productId);
    }

    this.saveToStorage(currentFavorites);
    this.favoritesSubject.next(currentFavorites);
    
    return of(!isFav).pipe(delay(300));
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
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🗑️ Global favorites cleared');
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
    const favorites = this.getCurrentFavorites();
    const localStorage = this.loadFromStorage();
    
    console.log('🔍 DEBUG STATE:');
    console.log('  - Favoris en mémoire:', favorites);
    console.log('  - Favoris localStorage:', localStorage);
  }
}
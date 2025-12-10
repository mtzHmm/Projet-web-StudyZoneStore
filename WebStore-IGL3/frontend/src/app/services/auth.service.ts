import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TEST_ACCOUNTS, LOCAL_STORAGE_KEYS as STORAGE_KEYS } from './mock-data';

export interface SignUpRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

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
export class AuthService {
  // BehaviorSubject to manage logged in user state
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor() {
    // Load user info from localStorage on app startup
    this.loadUserFromStorage();
  }

  // Load user info from localStorage
  private loadUserFromStorage() {
    const userData = localStorage.getItem(STORAGE_KEYS.USER);
    if (userData) {
      try {
        const user = JSON.parse(userData);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    }
  }

  // Registration - Mock implementation
  register(data: SignUpRequest): Observable<any> {
    console.log('📝 Mock registration for:', data.email);
    
    // Create a new mock user
    const newUser: User = {
      id: Math.floor(Math.random() * 10000),
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      role: 'CLIENT',
    };

    // Simulate API delay
    return of({
      success: true,
      message: 'Registration successful',
      user: newUser,
      token: 'mock_token_' + newUser.id,
    }).pipe(delay(500));
  }

  // Login - Mock implementation
  login(data: LoginRequest): Observable<any> {
    console.log('🔐 Mock login for:', data.email);
    
    // Check if it's a test account
    let user: User | null = null;
    let token: string | null = null;

    if (data.email === TEST_ACCOUNTS.admin.email && data.password === TEST_ACCOUNTS.admin.password) {
      user = TEST_ACCOUNTS.admin.user;
      token = 'mock_admin_token_' + user.id;
    } else if (data.email === TEST_ACCOUNTS.client.email && data.password === TEST_ACCOUNTS.client.password) {
      user = TEST_ACCOUNTS.client.user;
      token = 'mock_client_token_' + user.id;
    } else {
      // For any other email, create a mock user
      user = {
        id: Math.floor(Math.random() * 10000),
        firstName: 'User',
        lastName: data.email.split('@')[0],
        email: data.email,
        role: 'CLIENT',
      };
      token = 'mock_token_' + user.id;
    }

    // Store user and token
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    this.currentUserSubject.next(user);

    // Simulate API delay
    return of({
      success: true,
      message: 'Login successful',
      user: user,
      token: token,
    }).pipe(delay(500));
  }

  // Verify 2FA code - Mock implementation
  verify2FA(email: string, code: string): Observable<any> {
    console.log('✅ Mock 2FA verification for:', email);
    
    // In mock mode, any code works (just for demo)
    return of({
      success: true,
      message: '2FA verified successfully',
    }).pipe(delay(300));
  }

  // Resend 2FA code - Mock implementation
  resend2FA(email: string): Observable<any> {
    console.log('📨 Mock resend 2FA code to:', email);
    
    return of({
      success: true,
      message: '2FA code resent (mock)',
    }).pipe(delay(300));
  }

  // Set current logged in user
  setCurrentUser(user: User) {
    const previousUser = this.currentUserSubject.value;
    const previousUserId = previousUser?.id;
    const newUserId = user?.id;
    
    console.log('👤 User change in AuthService:', previousUserId, '→', newUserId);
    
    // If user changes, clean favorites
    if (previousUserId !== newUserId) {
      console.log('🧹 New user detected - cleaning localStorage favorites');
      localStorage.removeItem('current_user_id');
      localStorage.removeItem('studyzone_favorites');
    }
    
    // Update user
    this.currentUserSubject.next(user);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  // Get current logged in user
  getCurrentUser(): User | null {
    const token = this.getToken();
    if (!token) {
      return null; // No token = no logged in user
    }
    return this.currentUserSubject.value;
  }

  // Get JWT token
  getToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  }

  // Logout
  logout() {
    console.log('🚪 Logout in progress...');
    
    // Clean ALL localStorage items related to user
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem('current_user_id'); // Clean favorites tracker
    localStorage.removeItem('studyzone_favorites'); // Clean favorites
    
    // Emit null to trigger observables
    this.currentUserSubject.next(null);
    
    console.log('✅ Logout completed - cache cleaned');
  }

  // Check if user is logged in
  isLoggedIn(): boolean {
    const token = this.getToken();
    const user = this.currentUserSubject.value;
    return !!token && !!user;
  }

  // Check if current user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'ADMIN';
  }

  // Mock verify user endpoint
  verifyUser(): Observable<any> {
    return of({ success: true, message: 'User verified' }).pipe(delay(300));
  }
}
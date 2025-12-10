import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { MOCK_USERS } from './mock-data';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface UserPage {
  content: User[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

export interface UserStats {
  totalUsers: number;
  roleDistribution: {
    admin: number;
    client: number;
    member: number;
  };
  memberCount: number;
  nonMemberCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  // In-memory storage for users
  private users: User[] = JSON.parse(JSON.stringify(MOCK_USERS));
  private nextId: number = Math.max(...this.users.map(u => u.id)) + 1;
  
  // BehaviorSubject pour gérer l'état des utilisateurs
  private usersSubject = new BehaviorSubject<User[]>(this.users);
  public users$ = this.usersSubject.asObservable();
  
  constructor() {
    console.log('🏗️ UserService initialized with mock data');
  }

  /**
   * Récupère tous les utilisateurs avec pagination
   */
  getUsers(page: number = 0, size: number = 10, sortBy: string = 'id', sortDir: string = 'asc', search?: string): Observable<UserPage> {
    console.log('🔄 Mock getUsers - Page:', page, 'Size:', size, 'Search:', search);
    
    return of({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
      first: true,
      last: true
    }).pipe(
      delay(300),
      tap(() => {
        let filtered = [...this.users];

        // Apply search filter
        if (search && search.trim()) {
          const searchLower = search.toLowerCase();
          filtered = filtered.filter(user =>
            user.firstName.toLowerCase().includes(searchLower) ||
            user.lastName.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.role.toLowerCase().includes(searchLower)
          );
        }

        // Apply sorting
        filtered.sort((a, b) => {
          const aVal = (a as any)[sortBy];
          const bVal = (b as any)[sortBy];
          const direction = sortDir === 'desc' ? -1 : 1;

          if (typeof aVal === 'string') {
            return aVal.localeCompare(bVal) * direction;
          }
          return (aVal - bVal) * direction;
        });

        // Apply pagination
        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / size);
        const start = page * size;
        const end = start + size;
        const paginatedUsers = filtered.slice(start, end);

        // Update subject
        this.usersSubject.next(paginatedUsers);

        console.log('✅ Mock users retrieved:', paginatedUsers.length, 'sur', totalElements);
      })
    );
  }

  /**
   * Récupère un utilisateur par son ID
   */
  getUserById(id: number): Observable<User> {
    console.log('🔍 Mock getUserById:', id);
    
    const user = this.users.find(u => u.id === id);
    
    return of(user || ({} as User)).pipe(
      delay(300),
      tap(foundUser => {
        if (foundUser.email) {
          console.log('✅ Mock user found:', foundUser.email);
        }
      })
    );
  }

  /**
   * Met à jour le rôle d'un utilisateur
   */
  updateUserRole(id: number, role: string): Observable<User> {
    console.log('🔄 Mock updateUserRole - ID:', id, 'Role:', role);
    
    const index = this.users.findIndex(u => u.id === id);
    
    if (index === -1) {
      return of({} as User).pipe(delay(300));
    }

    const updatedUser = { ...this.users[index], role };
    this.users[index] = updatedUser;
    
    // Update subject
    const currentUsers = this.usersSubject.value;
    const updatedUsers = currentUsers.map(u => u.id === id ? updatedUser : u);
    this.usersSubject.next(updatedUsers);

    console.log('✅ Mock role updated for:', updatedUser.email);

    return of(updatedUser).pipe(delay(500));
  }

  /**
   * Supprime un utilisateur
   */
  deleteUser(id: number): Observable<any> {
    console.log('🗑️ Mock deleteUser:', id);
    
    const index = this.users.findIndex(u => u.id === id);
    
    if (index !== -1) {
      const deletedUser = this.users[index];
      this.users.splice(index, 1);
      
      // Update subject
      const currentUsers = this.usersSubject.value;
      const updatedUsers = currentUsers.filter(u => u.id !== id);
      this.usersSubject.next(updatedUsers);

      console.log('✅ Mock user deleted:', deletedUser.email);
    }

    return of({ message: 'User deleted successfully' }).pipe(delay(300));
  }

  /**
   * Récupère les statistiques des utilisateurs
   */
  getUserStats(): Observable<UserStats> {
    console.log('📊 Mock getUserStats');
    
    const stats: UserStats = {
      totalUsers: this.users.length,
      roleDistribution: {
        admin: this.users.filter(u => u.role === 'ADMIN').length,
        client: this.users.filter(u => u.role === 'CLIENT').length,
        member: this.users.filter(u => u.role === 'MEMBER').length,
      },
      memberCount: this.users.filter(u => u.role === 'MEMBER').length,
      nonMemberCount: this.users.filter(u => u.role !== 'MEMBER').length,
    };

    console.log('✅ Mock stats calculated:', stats);
    return of(stats).pipe(delay(300));
  }

  /**
   * Recherche des utilisateurs
   */
  searchUsers(searchTerm: string, page: number = 0, size: number = 10): Observable<UserPage> {
    console.log('🔍 Mock searchUsers:', searchTerm);
    return this.getUsers(page, size, 'id', 'asc', searchTerm);
  }

  /**
   * Récupère la liste actuelle des utilisateurs
   */
  getCurrentUsers(): User[] {
    return this.users;
  }

  /**
   * Clear la liste des utilisateurs
   */
  clearUsers(): void {
    this.usersSubject.next([]);
  }

  /**
   * Add new user (for registration)
   */
  addUser(user: Omit<User, 'id'>): User {
    const newUser: User = {
      ...user,
      id: this.nextId++
    };

    this.users.push(newUser);
    console.log('✅ Mock user added:', newUser.email);
    
    return newUser;
  }
}
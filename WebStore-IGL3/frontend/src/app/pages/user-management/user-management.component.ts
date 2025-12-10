import { Component, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { UserService, User, UserPage } from '../../services/user.service';

@Component({
  selector: 'app-user-management',
  imports: [CommonModule, FormsModule, SidebarComponent], 
  standalone: true,
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.css']
})
export class UserManagementComponent implements AfterViewInit, OnDestroy {
  @ViewChild('tableContainer', { static: false }) tableContainer!: ElementRef;

  // 🔎 champ de recherche lié à l'input
  searchUser: string = '';
  private searchTimeout: any;

  // Pagination properties
  currentPage = 0; // Backend utilise 0-based indexing
  pageSize = 10;
  isLoading = false;
  hasMoreData = true;
  totalUsers = 0;
  totalPages = 0;

  // Error handling
  errorMessage = '';
  
  // Currently displayed users
  users: User[] = [];
  
  constructor(private router: Router, private userService: UserService) {
    console.log('🏗️ UserManagementComponent initialisé');
    this.loadUsers();
  }

  ngAfterViewInit() {
    this.setupInfiniteScroll();
  }

  ngOnDestroy() {
    if (this.tableContainer?.nativeElement) {
      this.tableContainer.nativeElement.removeEventListener('scroll', this.onScroll.bind(this));
    }
  }

  // Load users from database
  private loadUsers() {
    console.log('🔄 Chargement des utilisateurs depuis la base de données...');
    this.isLoading = true;
    this.errorMessage = '';

    this.userService.getUsers(this.currentPage, this.pageSize).subscribe({
      next: (response: UserPage) => {
        console.log('✅ Utilisateurs chargés:', response.content.length);
        
        if (this.currentPage === 0) {
          // Première page - remplacer les utilisateurs
          this.users = response.content;
        } else {
          // Pages suivantes - ajouter aux utilisateurs existants
          this.users = [...this.users, ...response.content];
        }
        
        this.totalUsers = response.totalElements;
        this.totalPages = response.totalPages;
        this.hasMoreData = !response.last;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des utilisateurs:', error);
        this.errorMessage = `Erreur lors du chargement des utilisateurs: ${error.error?.message || error.message || 'Erreur inconnue'}`;
        this.isLoading = false;
      }
    });
  }

  // Setup infinite scroll
  private setupInfiniteScroll() {
    if (this.tableContainer?.nativeElement) {
      this.tableContainer.nativeElement.addEventListener('scroll', this.onScroll.bind(this));
    }
  }

  // Handle scroll event
  private onScroll() {
    const element = this.tableContainer.nativeElement;
    const threshold = 100; // Load more when 100px from bottom
    
    if (element.scrollTop + element.clientHeight >= element.scrollHeight - threshold) {
      if (!this.isLoading && this.hasMoreData) {
        this.loadMoreUsers();
      }
    }
  }

  // Load more users with pagination
  private loadMoreUsers() {
    if (this.isLoading || !this.hasMoreData) return;

    console.log('📄 Chargement de la page suivante:', this.currentPage + 1);
    this.currentPage++;
    this.loadUsers();
  }

  // Search functionality with debouncing
  onSearchChange() {
    clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.performSearch();
    }, 300);
  }

  // Perform search
  private performSearch() {
    console.log('🔍 Recherche d\'utilisateurs avec le terme:', this.searchUser);
    this.resetPagination();
    
    if (this.searchUser.trim()) {
      this.isLoading = true;
      this.userService.searchUsers(this.searchUser, 0, this.pageSize).subscribe({
        next: (response: UserPage) => {
          this.users = response.content;
          this.totalUsers = response.totalElements;
          this.totalPages = response.totalPages;
          this.hasMoreData = !response.last;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('❌ Erreur lors de la recherche:', error);
          this.errorMessage = 'Erreur lors de la recherche d\'utilisateurs';
          this.isLoading = false;
        }
      });
    } else {
      this.loadUsers();
    }
  }

  // Reset pagination for new search
  private resetPagination() {
    this.currentPage = 0;
    this.users = [];
    this.hasMoreData = true;
    this.isLoading = false;
    this.errorMessage = '';
  }

  // Get filtered users (for display)
  get filteredUsers(): User[] {
    return this.users; // La recherche est maintenant gérée côté serveur
  }

  // Get display name for user
  getUserDisplayName(user: User): string {
    return `${user.firstName} ${user.lastName}`;
  }

  // Voir utilisateur
  viewUser(user: User) {
    console.log('👁️ Affichage de l\'utilisateur:', user.email);
    localStorage.setItem('selectedClientName', this.getUserDisplayName(user));
    this.router.navigate(['/user-history', user.id]);
  }

  // Supprimer utilisateur avec confirmation
  deleteUser(user: User) {
    const userName = this.getUserDisplayName(user);
    if (confirm(`Voulez-vous vraiment supprimer ${userName} ?`)) {
      console.log('🗑️ Suppression de l\'utilisateur:', user.email);
      
      this.userService.deleteUser(user.id).subscribe({
        next: (response) => {
          console.log('✅ Utilisateur supprimé avec succès:', response.message);
          
          // Retirer l'utilisateur de la liste locale
          this.users = this.users.filter(u => u.id !== user.id);
          this.totalUsers--;
        },
        error: (error) => {
          console.error('❌ Erreur lors de la suppression:', error);
          this.errorMessage = `Erreur lors de la suppression: ${error.error?.message || error.message || 'Erreur inconnue'}`;
        }
      });
    }
  }

  // Update user role
  updateUserRole(user: User, newRole: string) {
    console.log('🔄 Mise à jour du rôle de l\'utilisateur:', user.email, 'vers:', newRole);
    
    // Clear any previous error messages
    this.errorMessage = '';
    
    this.userService.updateUserRole(user.id, newRole).subscribe({
      next: (updatedUser) => {
        console.log('✅ Rôle mis à jour avec succès');
        
        // Mettre à jour l'utilisateur dans la liste locale
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        
        // Show success message (optional)
        // You can add a success toast/notification here if needed
        console.log(`✅ Le rôle de ${updatedUser.firstName} ${updatedUser.lastName} a été mis à jour vers ${updatedUser.role}`);
      },
      error: (error) => {
        console.error('❌ Erreur lors de la mise à jour du rôle:', error);
        this.errorMessage = `Erreur lors de la mise à jour du rôle: ${error.error?.message || error.message || 'Erreur inconnue'}`;
        
        // Reset the select to the original value in case of error
        const selectElement = document.querySelector(`select[value="${newRole}"]`) as HTMLSelectElement;
        if (selectElement) {
          selectElement.value = user.role;
        }
      }
    });
  }

  // Handle role change event
  onRoleChange(user: User, event: Event) {
    const target = event.target as HTMLSelectElement;
    if (target && target.value) {
      const newRole = target.value;
      
      // Validate role values
      if (newRole === 'ADMIN' || newRole === 'CLIENT') {
        // Only update if the role has actually changed
        if (newRole !== user.role) {
          this.updateUserRole(user, newRole);
        }
      } else {
        console.error('❌ Rôle invalide:', newRole);
        this.errorMessage = 'Rôle invalide sélectionné';
        // Reset to original value
        target.value = user.role;
      }
    }
  }
}

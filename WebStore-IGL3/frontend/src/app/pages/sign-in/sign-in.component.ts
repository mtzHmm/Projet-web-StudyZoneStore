import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginRequest, User } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';



@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.css']
})
export class SignInComponent implements OnInit {
  signInForm: FormGroup; 
  errorMessage: string = '';
  successMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private router: Router, 
    private route: ActivatedRoute,
    private authService: AuthService,
    private notificationService: NotificationService
  ) {
    this.signInForm = this.fb.group({
      email: [''],
      password: [''],
    });
  }

  ngOnInit() {
    console.log('🔍 Sign-in component initialized');
    
    // Vérifier s'il y a un message dans les query params
    this.route.queryParams.subscribe(params => {
      console.log('🔍 Query params received:', params);
      
      if (params['message']) {
        const message = params['message'];
        const messageType = params['messageType'] || 'error';
        
        console.log('📨 Displaying notification - Message:', message, 'Type:', messageType);
        
        // Show notification immediately
        if (messageType === 'warning') {
          this.notificationService.warning(
            'Authentication Required',
            message,
            5000
          );
        } else {
          this.notificationService.error(
            'Session Expired',
            message,
            5000
          );
        }
        
        console.log('✅ Notification service called');
      }
    });
  }

  // Test de connectivité avec le backend
  testConnection() {
    console.log('Testing backend connection...');
    this.authService.login({ email: 'test@test.com', password: 'test' }).subscribe({
      next: (res) => {
        console.log('Backend connection successful (even if credentials are wrong):', res);
      },
      error: (err) => {
        console.log('Backend connection test - Error details:', err);
        if (err.status === 0) {
          console.error('❌ Cannot connect to backend - Backend might be down or CORS issue');
        } else {
          console.log('✅ Backend is reachable, status:', err.status);
        }
      }
    });
  }

  onSubmit() {
    console.log('onSubmit function called!'); // Debug log
    const { email, password } = this.signInForm.value;
    console.log('Form values:', { email, password }); // Debug log

    // Validation des champs
    if (!email || !password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    const loginData: LoginRequest = { email, password };
    
    console.log('Sending login request to:', 'http://localhost:8080/api/auth/login');
    console.log('With data:', loginData);
    
    // Appel à l'API login
    this.authService.login({ email, password }).subscribe({
      next: (res: any) => {
        console.log('Login successful:', res); // Debug log
        
        // Check if 2FA is required
        if (res.twoFactorRequired) {
          console.log('2FA required, navigating to verification page');
          this.successMessage = "Verification code sent to your email!";
          
          // Store email in sessionStorage as backup
          sessionStorage.setItem('pending_2fa_email', res.email || email);
          
          // Navigate to 2FA verification page after 1 second
          setTimeout(() => {
            this.router.navigate(['/verify-2fa'], {
              state: { email: res.email || email }
            });
          }, 1000);
          return;
        }
        
        // If no 2FA required, proceed with normal login
        // Stocker le token JWT
        localStorage.setItem('token', res.token);

        // Créer l'objet utilisateur (adapter selon la réponse de votre backend)
        const user: User = {
          id: res.userDetails?.id || res.id,
          firstName: res.userDetails?.firstName || res.firstName || 'User', // Use backend firstName, fallback to 'User'
          lastName: res.userDetails?.lastName || res.lastName || '', // Use backend lastName
          email: res.userDetails?.email || res.email || email,
          role: res.userDetails?.role || res.role || 'CLIENT' // Include role from backend
        };

        console.log('🔍 Login - Backend response:', res);
        console.log('🔍 Login - Created user object:', user);
        console.log('🔍 Login - User ID extracted:', user.id);

        // Définir l'utilisateur connecté dans le service
        this.authService.setCurrentUser(user);

        // Message succès
        this.successMessage = "Login successful!";
        
        // Redirection après 1 seconde
        setTimeout(() => this.router.navigate(['/landing']), 1000);
      },
      error: (err: any) => {
        console.error('Detailed login error:', err);
        console.error('Error status:', err.status);
        console.error('Error status text:', err.statusText);
        console.error('Error message:', err.message);
        console.error('Error body:', err.error);
        
        // Messages d'erreur plus détaillés
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if the backend is running.';
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (err.status === 404) {
          this.errorMessage = 'Login endpoint not found';
        } else if (err.status === 500) {
          this.errorMessage = 'Server error. Please try again later.';
        } else {
          this.errorMessage = err.error?.message || `Error ${err.status}: ${err.statusText}` || 'Error during login';
        }
      }
    });
  }

  private generateLastName(firstName: string, email: string): string {
    // Si firstName contient plusieurs mots, prendre le dernier comme lastName
    if (firstName && firstName.includes(' ')) {
      const nameParts = firstName.split(' ');
      return nameParts[nameParts.length - 1];
    }
    
    // Extraire le nom de l'email (partie avant @)
    const emailName = email.split('@')[0];
    // Si l'emailName est différent du firstName, l'utiliser comme lastName
    if (emailName !== firstName) {
      return emailName;
    }
    
    // Fallback: utiliser le firstName + "User" comme lastName
    return firstName + 'User';
  }
}

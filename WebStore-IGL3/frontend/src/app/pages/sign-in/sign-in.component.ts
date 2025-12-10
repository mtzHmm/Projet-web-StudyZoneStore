import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
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

  onSubmit() {
    console.log('onSubmit function called!');
    const { email, password } = this.signInForm.value;
    console.log('Form values:', { email, password });

    // Validation des champs
    if (!email || !password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.errorMessage = '';
    this.successMessage = 'Login successful! Redirecting...';
    
    // Simulate login success and redirect to landing
    setTimeout(() => {
      this.router.navigate(['/landing']);
    }, 1000);
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

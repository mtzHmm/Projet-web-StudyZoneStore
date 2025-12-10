import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService, SignUpRequest, User } from '../../services/auth.service';


@Component({
  selector: 'app-account-info',
  standalone : true,
  imports: [ ReactiveFormsModule, CommonModule,RouterLink],
   templateUrl: './account-info.component.html',
  styleUrls: ['./account-info.component.css']
})
export class AccountInfo {
  signupForm: FormGroup; 
  errorMessage: string = '';
  indicationMsg: string = '';
  successMessage: string = '';
  

constructor(private fb: FormBuilder, private router: Router, private authService: AuthService) {
  this.signupForm = this.fb.group({
    firstName: [''],
    lastName: [''],
    email: [''],
    password: [''],
  });
}
  onSubmit() {
  const { firstName, lastName, email, password } = this.signupForm.value;

  if (!firstName || firstName.length < 2) {
    this.errorMessage = "First name too short"
    return;
  }
  if (!lastName || lastName.length < 2) {
    this.errorMessage = "Last name too short";
    return;
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    this.errorMessage = "Please enter a valid email";
    return;
  }
  if (!password || password.length < 6) {
    this.errorMessage = "Password must be at least 6 characters long";
    this.indicationMsg = "Please enter a password with at least 6 characters for security.";
    return;
  }
  // Check for stronger password (optional but recommended)
  if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    this.indicationMsg = "For better security, consider including uppercase, lowercase, and numbers in your password.";
  }
  this.indicationMsg="";
  this.errorMessage = '';  
  const signUpData: SignUpRequest = { firstName, lastName, email, password };
  this.authService.register(signUpData).subscribe({
      next: (res:any) => {
      // Check if 2FA is required
      if (res.twoFactorRequired) {
        console.log('2FA required after registration, navigating to verification page');
        this.successMessage = "Account created! Verification code sent to your email.";
        
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
      
      // If no 2FA required (old accounts), proceed with normal registration
      localStorage.setItem('token', res.token);
      
      // Create user object from the registration response
      const user: User = {
        id: res.userDetails?.id,
        firstName: res.userDetails?.firstName || firstName,
        lastName: res.userDetails?.lastName || lastName, 
        email: res.userDetails?.email || email,
        role: res.userDetails?.role || 'CLIENT' // Default role for new registrations
      };
      
      // Set the current user in the auth service
      this.authService.setCurrentUser(user);
      
       this.successMessage = "Registration successful! You can now log in.";
      setTimeout(() => this.router.navigate(['/landing']), 2000);
      },
      error: (err: any) => {
  console.error('Detailed registration error:', err);
  this.errorMessage = err.error?.message || 'Error during registration';
}

    });
  }
}
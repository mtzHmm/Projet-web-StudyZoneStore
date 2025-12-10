import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';


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
  

constructor(private fb: FormBuilder, private router: Router) {
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
  
  // Simulate successful registration
  this.successMessage = "Registration successful! Redirecting to landing page...";
  setTimeout(() => this.router.navigate(['/landing']), 2000);
  }
}
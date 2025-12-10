import { Component, ElementRef, QueryList, ViewChildren, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-2fa',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './verify-2fa.component.html',
  styleUrls: ['./verify-2fa.component.css']
})
export class Verify2faComponent implements AfterViewInit {
  @ViewChildren('codeInput') codeInputs!: QueryList<ElementRef>;
  
  code: string[] = ['', '', '', '', '', ''];
  errorMessage: string = '';
  successMessage: string = '';
  email: string = '';
  private isProcessing: boolean = false;

  constructor(private router: Router, private authService: AuthService) {
    // Get email from navigation state or sessionStorage
    const navigation = this.router.getCurrentNavigation();
    this.email = navigation?.extras?.state?.['email'] || sessionStorage.getItem('pending_2fa_email') || '';
    
    console.log('🔐 Verify2FA Component loaded');
    console.log('📧 Email from navigation:', this.email);
    
    // If no email, show error message instead of redirecting
    if (!this.email) {
      console.warn('⚠️  No email provided in navigation state');
      this.errorMessage = 'No email provided. Please register or login first.';
    }
  }

  ngAfterViewInit() {
    // Auto-focus first input
    setTimeout(() => {
      const firstInput = this.codeInputs.toArray()[0];
      if (firstInput) {
        firstInput.nativeElement.focus();
      }
    }, 100);
  }

  onInput(event: any, index: number) {
    if (this.isProcessing) {
      return;
    }
    
    this.isProcessing = true;
    
    const input = event.target as HTMLInputElement;
    
    // Keep only digits
    let value = input.value.replace(/\D/g, '');
    
    // Limit to 1 digit per box - take the last character entered
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }
    
    // Update the model and input value
    this.code[index] = value;
    input.value = value;
    
    // Auto-move to next input if a digit was entered and not the last box
    if (value && index < 5) {
      setTimeout(() => {
        const nextInput = this.codeInputs.toArray()[index + 1].nativeElement;
        // Only clear the next input if it's empty (first time filling)
        if (!this.code[index + 1]) {
          nextInput.value = '';
        }
        nextInput.focus();
        this.isProcessing = false;
      }, 50);
    } else {
      // If it's the last box, keep focus on it
      if (index === 5 && value) {
        setTimeout(() => {
          input.focus();
        }, 0);
      }
      this.isProcessing = false;
    }
  }

  onKeyDown(event: KeyboardEvent, index: number) {
    const input = event.target as HTMLInputElement;

    // Handle Enter key to submit
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onSubmit();
      return;
    }

    // Handle backspace
    if (event.key === 'Backspace') {
      event.preventDefault();
      
      // If current box has content, clear it and keep focus
      if (this.code[index]) {
        this.code[index] = '';
        // Don't move focus - it stays automatically
      } 
      // Only if current box is already empty, go to previous box
      else if (index > 0) {
        const prevInput = this.codeInputs.toArray()[index - 1].nativeElement;
        // Clear the previous box and move there
        this.code[index - 1] = '';
        prevInput.focus();
      }
    }
    // Handle left arrow
    else if (event.key === 'ArrowLeft' && index > 0) {
      const prevInput = this.codeInputs.toArray()[index - 1].nativeElement;
      prevInput.focus();
      prevInput.select();
    }
    // Handle right arrow
    else if (event.key === 'ArrowRight' && index < 5) {
      const nextInput = this.codeInputs.toArray()[index + 1].nativeElement;
      nextInput.focus();
      nextInput.select();
    }
  }

  onPaste(event: ClipboardEvent) {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);
    
    // Fill all boxes with pasted digits
    for (let i = 0; i < 6; i++) {
      if (i < digits.length) {
        this.code[i] = digits[i];
        const input = this.codeInputs.toArray()[i].nativeElement;
        input.value = digits[i];
      }
    }
    
    // Focus the next empty box or the last one
    const nextEmptyIndex = digits.length < 6 ? digits.length : 5;
    
    setTimeout(() => {
      const input = this.codeInputs.toArray()[nextEmptyIndex];
      if (input) {
        input.nativeElement.focus();
      }
    }, 0);
  }

  onSubmit() {
    console.log('🔍 Submit clicked!');
    console.log('📝 Code array:', this.code);
    console.log('📧 Email:', this.email);
    
    const verificationCode = this.code.join('');
    console.log('🔐 Verification code:', verificationCode);
    
    if (verificationCode.length !== 6) {
      console.warn('⚠️ Code length is not 6:', verificationCode.length);
      this.errorMessage = 'Please enter all 6 digits';
      return;
    }

    if (!this.email) {
      console.error('❌ No email provided!');
      this.errorMessage = 'No email provided. Please register first.';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';

    console.log('✅ Calling verify2FA API...');
    
    // Call the 2FA verification API
    this.authService.verify2FA(this.email, verificationCode).subscribe({
      next: (res: any) => {
        console.log('2FA verification successful:', res);
        
        // Store the token
        localStorage.setItem('token', res.token);

        // Create user object
        const user = {
          id: res.userDetails?.id || res.id,
          firstName: res.userDetails?.firstName || res.firstName || 'User',
          lastName: res.userDetails?.lastName || res.lastName || '',
          email: res.userDetails?.email || res.email || this.email,
          role: res.userDetails?.role || res.role || 'CLIENT'
        };

        this.authService.setCurrentUser(user);
        this.successMessage = "Verification successful!";
        
        // Clear the pending 2FA email from sessionStorage
        sessionStorage.removeItem('pending_2fa_email');
        
        // Redirect to landing page
        setTimeout(() => this.router.navigate(['/landing']), 1000);
      },
      error: (err: any) => {
        console.error('2FA verification error:', err);
        
        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please try again.';
        } else if (err.status === 401) {
          this.errorMessage = 'Invalid verification code';
        } else {
          this.errorMessage = err.error?.message || 'Verification failed. Please try again.';
        }
      }
    });
  }

  resendCode() {
    // Call the resend 2FA code API
    this.authService.resend2FA(this.email).subscribe({
      next: () => {
        this.successMessage = 'A new code has been sent to your email';
        this.code = ['', '', '', '', '', ''];
        this.errorMessage = '';
        
        // Focus first input
        setTimeout(() => {
          const firstInput = this.codeInputs.toArray()[0];
          if (firstInput) {
            firstInput.nativeElement.focus();
          }
        }, 0);
      },
      error: (err: any) => {
        console.error('Resend code error:', err);
        this.errorMessage = 'Failed to resend code. Please try again.';
      }
    });
  }
}

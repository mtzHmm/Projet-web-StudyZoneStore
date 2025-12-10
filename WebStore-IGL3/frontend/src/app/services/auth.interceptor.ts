import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Get the JWT token from localStorage
    const token = localStorage.getItem('token');
    
    // If we have a token, clone the request and add the Authorization header
    if (token) {
      const authReq = req.clone({
        headers: req.headers.set('Authorization', `Bearer ${token}`)
      });
      console.log('🔒 Adding JWT token to request:', req.url);
      
      return next.handle(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          // Si 401 ou 403, l'utilisateur n'est plus authentifié (compte supprimé, token expiré, etc.)
          if (error.status === 401 || error.status === 403) {
            console.log('❌ Authentication error - logging out user immediately');
            
            // Déconnecter l'utilisateur (nettoie localStorage)
            this.authService.logout();
            
            // Rediriger immédiatement vers la page de connexion avec un message
            setTimeout(() => {
              this.router.navigate(['/sign-in'], {
                queryParams: { message: 'Your session has expired or your account is no longer active. Please sign in again.' }
              });
            }, 0);
          }
          
          return throwError(() => error);
        })
      );
    }
    
    // If no token, proceed with the original request
    return next.handle(req);
  }
}
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { NotificationContainerComponent } from './components/notification-container/notification-container.component';
import { filter } from 'rxjs';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, NavbarComponent, FooterComponent, NotificationContainerComponent, CommonModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  showFooter = true;
  showNavbar = true;

  constructor(private router: Router) {}

  ngOnInit() {
    // Listen to route changes to hide footer on specific pages
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Define admin dashboard routes where footer should be hidden
      const adminRoutes = [
        '/dashboard',
        '/product-management',
        '/category-management', 
        '/products',
        '/order-management',
        '/user-management',
        '/user-history',
        '/historic-details',
        '/product-mod',
        '/order-details',
        '/stats',
        '/contact-admin',
        '/checkout',
        '/verify-2fa'
      ];
      
      // Hide footer on admin dashboard pages and checkout page
      this.showFooter = !adminRoutes.some(route => event.url.includes(route));
      
      // Hide navbar on 2FA page
      this.showNavbar = !event.url.includes('/verify-2fa');
    });
  }
}

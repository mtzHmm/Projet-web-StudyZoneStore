
import { Routes } from '@angular/router';

import { LandingComponent } from './pages/landing/landing.component';
import { ShopComponent } from './pages/shop/shop.component';
import { CartComponent } from './pages/cart/cart.component';
import { AccountInfo } from './pages/account-info/account-info.component';
import { SignInComponent } from './pages/sign-in/sign-in.component';
import { Checkout } from './pages/checkout/checkout.component';
import { Contact } from './pages/contact/contact.component';
import { ProductManagementComponent } from './pages/products/product-management/product-management.component';
import { CategoryManagementComponent } from './pages/products/category-management/category-management.component';
import { ProductsComponent } from './pages/products/products.component';
import { OrderManagementComponent } from './pages/order-management/order-management.component';
import { UserManagementComponent } from './pages/user-management/user-management.component';
import { HistoricDetailsComponent } from './pages/historic-details/historic-details.component';
import { UserHistoryComponent } from './pages/user-history/user-history.component';
import { AdminDashboard } from './pages/admin-dashboard/admin-dashboard.component';
import { Details } from './pages/details/details.component';
import { ProductMod } from './pages/product-mod/product-mod.component';
import { OrderDetails } from './pages/order-details/order-details.component';
import { Stats } from './pages/stats/stats.component';
import { ContactAdmin } from './pages/contact-admin/contact-admin.component';



export const routes: Routes = [
  // Public routes
  { path: '', component: LandingComponent },
  { path: 'shop', component: ShopComponent },
  { path: 'details/:id', component: Details },
  { path: 'contact', component: Contact },
  { path: 'sign-in', component: SignInComponent},
  { path: 'account-info', component: AccountInfo }, // Used for both registration and account display
  
  // Cart and checkout - now public
  { path: 'cart', component: CartComponent },
  { path: 'checkout', component: Checkout },
  
  // Admin routes (temporarily removed security)
  { path: 'dashboard', component: AdminDashboard },
  { path: 'product-management', component: ProductManagementComponent },
  { path: 'category-management', component: CategoryManagementComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'order-management', component: OrderManagementComponent },
  { path: 'user-management', component: UserManagementComponent },
  { path: 'user-history/:id', component: UserHistoryComponent },
  { path: 'historic-details/:orderId/:userId', component: HistoricDetailsComponent },
  { path: 'product-mod', component: ProductMod },
  { path: 'product-mod/:id', component: ProductMod }, 
  { path: 'order-details/:id', component: OrderDetails },
  { path: 'stats', component: Stats },
  { path: 'contact-admin', component: ContactAdmin },
  
  // Wildcard route
  { path: '**', redirectTo: '' }
];

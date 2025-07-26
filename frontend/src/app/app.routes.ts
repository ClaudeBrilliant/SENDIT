import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { ForgotPasswordComponent } from './auth/components/forgot-password/forgot-password.component';
import { ContactComponent } from './pages/contact/contact.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { ServicesComponent } from './shared/components/services/services.component';
import { AboutComponent } from './shared/components/about/about.component';
import { UserDashboardComponent } from './user/components/dashboard/dashboard.component';
import { ProfileComponent } from './user/components/profile/profile.component';
import { TrackParcelComponent } from './user/components/track-parcel/track-parcel.component';
import { CourierGuard } from './courier/courier.guard';
import { CourierDashboardComponent } from './courier/components/dashboard/courier-dashboard.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'login', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: 'register', redirectTo: 'auth/register', pathMatch: 'full' },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'faqs', component: FaqsComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'user/dashboard', component: UserDashboardComponent },
  { path: 'user/profile', component: ProfileComponent },
  { path: 'track-parcel', component: TrackParcelComponent },
  {
    path: 'courier/dashboard',
    component: CourierDashboardComponent,
    canActivate: [CourierGuard], // Assume you have a CourierGuard for role-based access
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.ADMIN_ROUTES)
  }
];

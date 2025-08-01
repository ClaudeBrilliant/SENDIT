import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { ForgotPasswordComponent } from './auth/components/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './auth/components/reset-password/reset-password.component';
import { ContactComponent } from './pages/contact/contact.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { ServicesComponent } from './shared/components/services/services.component';
import { AboutComponent } from './shared/components/about/about.component';
import { AdminDashboardComponent } from './admin/components/dashboard/admin-dashboard.component';
import { CreateOrderComponent } from './admin/components/create-order/create-order.component';
import { ProfileComponent } from './user/components/profile/profile.component';
import { UserDashboardComponent } from './user/components/dashboard/dashboard.component';
import { TrackParcelComponent } from './user/components/track-parcel/track-parcel.component';

const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: 'auth/forgot-password', component: ForgotPasswordComponent },
  { path: 'auth/reset-password', component: ResetPasswordComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'faqs', component: FaqsComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'about', component: AboutComponent },
  { path: 'admin/dashboard', component: AdminDashboardComponent },
  { path: 'admin/create-order', component: CreateOrderComponent },
  { path: 'user/profile', component: ProfileComponent },
  { path: 'user/dashboard', component: UserDashboardComponent },
  { path: 'user/track-parcel', component: TrackParcelComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';

// Import other necessary modules
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './auth/components/login/login.component';
import { RegisterComponent } from './auth/components/register/register.component';
import { ForgotPasswordComponent } from './auth/components/forgot-password/forgot-password.component';
import { ContactComponent } from './pages/contact/contact.component';
import { FaqsComponent } from './pages/faqs/faqs.component';
import { ServicesComponent } from './shared/components/services/services.component';
import { AboutComponent } from './shared/components/about/about.component';
import { CreateOrderComponent } from './admin/components/create-order/create-order.component';
import { AdminDashboardComponent } from './admin/components/dashboard/admin-dashboard.component';
import { ProfileComponent } from './user/components/profile/profile.component';

@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ForgotPasswordComponent,
    ContactComponent,
    FaqsComponent,
    ServicesComponent,
    AboutComponent,
    CreateOrderComponent,
    AdminDashboardComponent,
    ProfileComponent
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
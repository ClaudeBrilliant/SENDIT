import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './components/dashboard/admin-dashboard.component';
import { CreateOrderComponent } from './components/create-order/create-order.component';
import { ManageOrdersComponent } from './components/manage-orders/manage-orders.component';
import { UserManagementComponent } from './components/user-management/user-management.component';

export const ADMIN_ROUTES: Routes = [
  { path: 'dashboard', component: AdminDashboardComponent },
  { path: 'create-order', component: CreateOrderComponent },
  { path: 'manage-orders', component: ManageOrdersComponent },
  { path: 'user-management', component: UserManagementComponent }
]; 
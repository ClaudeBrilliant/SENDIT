import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthState {
  isLoggedIn: boolean;
  userRole: string;
  user: any;
}

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private authStateSubject = new BehaviorSubject<AuthState>({
    isLoggedIn: false,
    userRole: '',
    user: null
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor() {
    this.checkInitialAuthState();
  }

  public checkInitialAuthState(): void {
    const token = localStorage.getItem('access_token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      try {
        const userData = JSON.parse(user);
        this.updateAuthState({
          isLoggedIn: true,
          userRole: userData.role || '',
          user: userData
        });
      } catch (e) {
        this.clearAuthState();
      }
    } else {
      this.clearAuthState();
    }
  }

  updateAuthState(state: AuthState): void {
    this.authStateSubject.next(state);
  }

  setLoggedIn(token: string, user: any): void {
    localStorage.setItem('access_token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    this.updateAuthState({
      isLoggedIn: true,
      userRole: user.role || '',
      user: user
    });
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.clearAuthState();
  }

  private clearAuthState(): void {
    this.updateAuthState({
      isLoggedIn: false,
      userRole: '',
      user: null
    });
  }

  getCurrentAuthState(): AuthState {
    return this.authStateSubject.value;
  }
} 
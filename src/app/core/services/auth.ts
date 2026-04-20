import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, finalize, tap } from 'rxjs';
import { ApiService } from './api';
import { AppStateService } from './app-state';
import { AuthResponse, User } from '../models/user.model';

const TOKEN_KEY = 'saas-web.token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  private readonly appState = inject(AppStateService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private readonly tokenSignal = signal<string | null>(this.readStoredToken());
  readonly token = this.tokenSignal.asReadonly();

  login(email: string, password: string): Observable<AuthResponse> {
    this.appState.setLoading(true);
    return this.api.post<AuthResponse>('/auth/login', { email, password }).pipe(
      tap((res) => this.handleAuthSuccess(res)),
      finalize(() => this.appState.setLoading(false)),
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.appState.setUser(null);
    if (this.isBrowser) localStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.tokenSignal() !== null;
  }

  setSession(token: string, user: User): void {
    this.handleAuthSuccess({ token, user });
  }

  private handleAuthSuccess(res: AuthResponse): void {
    this.tokenSignal.set(res.token);
    this.appState.setUser(res.user);
    if (this.isBrowser) localStorage.setItem(TOKEN_KEY, res.token);
  }

  private readStoredToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(TOKEN_KEY);
  }
}

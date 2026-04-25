import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, finalize, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppStateService } from './app-state';
import { AuthResponse, AuthTokens, User } from '../models/user.model';

const ACCESS_KEY = 'saas-web.accessToken';
const REFRESH_KEY = 'saas-web.refreshToken';

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface BootstrapInput {
  email: string;
  password: string;
  name?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly appState = inject(AppStateService);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly baseUrl = environment.apiUrl;

  private readonly accessTokenSignal = signal<string | null>(this.readStored(ACCESS_KEY));
  private readonly refreshTokenSignal = signal<string | null>(this.readStored(REFRESH_KEY));
  private readonly initializedSignal = signal(false);

  readonly accessToken = this.accessTokenSignal.asReadonly();
  readonly refreshToken = this.refreshTokenSignal.asReadonly();
  readonly initialized = this.initializedSignal.asReadonly();
  readonly hasToken = computed(() => this.accessTokenSignal() !== null);

  register(input: RegisterInput): Observable<AuthResponse> {
    this.appState.setLoading(true);
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, input).pipe(
      tap((res) => this.applySession(res)),
      finalize(() => this.appState.setLoading(false)),
    );
  }

  login(input: LoginInput): Observable<AuthResponse> {
    this.appState.setLoading(true);
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, input).pipe(
      tap((res) => this.applySession(res)),
      finalize(() => this.appState.setLoading(false)),
    );
  }

  superAdminBootstrap(input: BootstrapInput): Observable<AuthResponse> {
    this.appState.setLoading(true);
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/bootstrap`, input).pipe(
      tap((res) => this.applySession(res)),
      finalize(() => this.appState.setLoading(false)),
    );
  }

  refresh(): Observable<AuthTokens> {
    const refreshToken = this.refreshTokenSignal();
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token'));
    }
    return this.http
      .post<AuthTokens>(`${this.baseUrl}/auth/refresh`, { refreshToken })
      .pipe(tap((tokens) => this.applyTokens(tokens)));
  }

  logout(): Observable<void> {
    const token = this.accessTokenSignal();
    const clear = () => this.clearSession();

    if (!token) {
      clear();
      return of(void 0);
    }
    return this.http
      .post<void>(`${this.baseUrl}/auth/logout`, null)
      .pipe(
        catchError(() => of(void 0)),
        tap(() => clear()),
        switchMap(() => of(void 0)),
      );
  }

  fetchProfile(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/users/me`).pipe(
      tap((user) => this.appState.setUser(user)),
    );
  }

  bootstrap(): Observable<User | null> {
    if (!this.accessTokenSignal()) {
      this.initializedSignal.set(true);
      return of(null);
    }
    return this.fetchProfile().pipe(
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
      finalize(() => this.initializedSignal.set(true)),
    );
  }

  applyTokens(tokens: AuthTokens): void {
    this.accessTokenSignal.set(tokens.accessToken);
    this.refreshTokenSignal.set(tokens.refreshToken);
    this.persist(ACCESS_KEY, tokens.accessToken);
    this.persist(REFRESH_KEY, tokens.refreshToken);
  }

  clearSession(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.appState.setUser(null);
    this.persist(ACCESS_KEY, null);
    this.persist(REFRESH_KEY, null);
  }

  isAuthenticated(): boolean {
    return this.accessTokenSignal() !== null;
  }

  private applySession(res: AuthResponse): void {
    this.applyTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    this.appState.setUser(res.user);
  }

  private readStored(key: string): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(key);
  }

  private persist(key: string, value: string | null): void {
    if (!this.isBrowser) return;
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
}

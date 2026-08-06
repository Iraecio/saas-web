import { HttpClient } from '@angular/common/http';
import { Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Observable, catchError, finalize, of, switchMap, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AppStateService } from './app-state';
import { AuthResponse, AuthTokens, User } from '../models/user.model';

const ACCESS_KEY = 'saas-web.accessToken';
const REFRESH_KEY = 'saas-web.refreshToken';
const LAST_ACTIVITY_KEY = 'saas-web.lastActivityAt';
const IDLE_TIMEOUT_MS = 8 * 60 * 60 * 1000;
const ACTIVITY_WRITE_INTERVAL_MS = 60 * 1000;

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
}

export interface RegisterResellerInput {
  email: string;
  password: string;
  name: string;
  companyName?: string;
}

export interface RegisterResellerResponse extends AuthResponse {
  defaultDomain: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface DevLoginUser {
  name: string | null;
  email: string;
  role: User['role'];
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
  private lastActivityWrite = 0;
  private activityTrackingStarted = false;
  private idleTimer: ReturnType<typeof setTimeout> | null = null;

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

  registerReseller(input: RegisterResellerInput): Observable<RegisterResellerResponse> {
    this.appState.setLoading(true);
    return this.http
      .post<RegisterResellerResponse>(`${this.baseUrl}/auth/register-reseller`, input)
      .pipe(finalize(() => this.appState.setLoading(false)));
  }

  login(input: LoginInput): Observable<AuthResponse> {
    this.appState.setLoading(true);
    return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, input).pipe(
      tap((res) => this.applySession(res)),
      finalize(() => this.appState.setLoading(false)),
    );
  }

  listDevUsers(): Observable<DevLoginUser[]> {
    return this.http.get<DevLoginUser[]>(`${this.baseUrl}/auth/dev-users`);
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
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, null).pipe(
      catchError(() => of(void 0)),
      tap(() => clear()),
      switchMap(() => of(void 0)),
    );
  }

  forgotPassword(email: string): Observable<void> {
    const origin = this.isBrowser ? window.location.origin : '';
    // @IsUrl() da API rejeita localhost — só envia redirectTo em produção
    const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
    const body: Record<string, string> = { email };
    if (!isLocalhost && origin) {
      body['redirectTo'] = `${origin}/auth/reset-password`;
    }
    return this.http.post<void>(`${this.baseUrl}/auth/forgot-password`, body);
  }

  resetPassword(token: string, newPassword: string, confirmNewPassword: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/reset-password`, {
      token,
      newPassword,
      confirmNewPassword,
    });
  }

  changePassword(
    currentPassword: string,
    newPassword: string,
    confirmNewPassword: string,
  ): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/change-password`, {
      currentPassword,
      newPassword,
      confirmNewPassword,
    });
  }

  fetchProfile(): Observable<User> {
    return this.http
      .get<User>(`${this.baseUrl}/users/me`)
      .pipe(tap((user) => this.appState.setUser(user)));
  }

  bootstrap(): Observable<User | null> {
    if (!this.hasRestorableSession() || this.isIdleExpired()) {
      this.clearSession();
      this.initializedSignal.set(true);
      return of(null);
    }

    const restore$ = this.shouldRefreshBeforeProfile()
      ? this.refresh().pipe(switchMap(() => this.fetchProfile()))
      : this.fetchProfile();

    return restore$.pipe(
      tap(() => {
        this.touchActivity(true);
        this.startActivityTracking();
      }),
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
    this.touchActivity(true);
    this.startActivityTracking();
  }

  clearSession(): void {
    this.accessTokenSignal.set(null);
    this.refreshTokenSignal.set(null);
    this.appState.setUser(null);
    this.persist(ACCESS_KEY, null);
    this.persist(REFRESH_KEY, null);
    this.persist(LAST_ACTIVITY_KEY, null);
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }

  isAuthenticated(): boolean {
    return this.accessTokenSignal() !== null;
  }

  private applySession(res: AuthResponse): void {
    this.applyTokens({ accessToken: res.accessToken, refreshToken: res.refreshToken });
    this.appState.setUser(res.user);
  }

  private hasRestorableSession(): boolean {
    return this.accessTokenSignal() !== null || this.refreshTokenSignal() !== null;
  }

  private shouldRefreshBeforeProfile(): boolean {
    const accessToken = this.accessTokenSignal();
    return !accessToken || this.isJwtExpired(accessToken);
  }

  private isJwtExpired(token: string): boolean {
    if (!this.isBrowser) return false;
    try {
      const payload = JSON.parse(this.decodeJwtPart(token.split('.')[1])) as { exp?: number };
      return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now() + 30_000;
    } catch {
      return true;
    }
  }

  private decodeJwtPart(value: string | undefined): string {
    if (!value) throw new Error('Invalid token');
    const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map((character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
  }

  private isIdleExpired(): boolean {
    if (!this.isBrowser) return false;
    const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
    return Number.isFinite(stored) && stored > 0 && Date.now() - stored >= IDLE_TIMEOUT_MS;
  }

  private startActivityTracking(): void {
    if (!this.isBrowser || this.activityTrackingStarted) {
      this.scheduleIdleLogout();
      return;
    }
    this.activityTrackingStarted = true;
    const registerActivity = () => this.touchActivity();
    for (const event of ['pointerdown', 'keydown', 'scroll', 'touchstart'] as const) {
      window.addEventListener(event, registerActivity, { passive: true });
    }
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (this.isIdleExpired()) this.handleIdleLogout();
        else this.touchActivity();
      }
    });
    this.scheduleIdleLogout();
  }

  private touchActivity(force = false): void {
    if (!this.isBrowser || !this.hasRestorableSession()) return;
    const now = Date.now();
    if (!force && now - this.lastActivityWrite < ACTIVITY_WRITE_INTERVAL_MS) return;
    this.lastActivityWrite = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    this.scheduleIdleLogout();
  }

  private scheduleIdleLogout(): void {
    if (!this.isBrowser || !this.hasRestorableSession()) return;
    if (this.idleTimer) clearTimeout(this.idleTimer);
    const lastActivity = Number(localStorage.getItem(LAST_ACTIVITY_KEY)) || Date.now();
    const remaining = Math.max(0, IDLE_TIMEOUT_MS - (Date.now() - lastActivity));
    this.idleTimer = setTimeout(() => this.handleIdleLogout(), remaining);
  }

  private handleIdleLogout(): void {
    if (!this.isBrowser || !this.isIdleExpired()) {
      this.scheduleIdleLogout();
      return;
    }
    this.logout().subscribe(() => window.location.assign('/auth/login'));
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

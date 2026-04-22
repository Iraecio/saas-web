import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { User } from '../models/user.model';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class AppStateService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal(false);
  private readonly themeSignal = signal<Theme>(this.readInitialTheme());
  private readonly sidebarOpenSignal = signal(true);

  readonly user = this.userSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly theme = this.themeSignal.asReadonly();
  readonly sidebarOpen = this.sidebarOpenSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly isAdmin = computed(() => {
    const role = this.userSignal()?.role;
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
  });

  constructor() {
    effect(() => {
      if (!this.isBrowser) return;
      const theme = this.themeSignal();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      localStorage.setItem('theme', theme);
    });
  }

  setUser(user: User | null): void {
    this.userSignal.set(user);
  }

  setLoading(loading: boolean): void {
    this.loadingSignal.set(loading);
  }

  setTheme(theme: Theme): void {
    this.themeSignal.set(theme);
  }

  toggleTheme(): void {
    this.themeSignal.update((t) => (t === 'light' ? 'dark' : 'light'));
  }

  toggleSidebar(): void {
    this.sidebarOpenSignal.update((open) => !open);
  }

  private readInitialTheme(): Theme {
    if (!this.isBrowser) return 'light';
    const stored = localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') return stored;
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}

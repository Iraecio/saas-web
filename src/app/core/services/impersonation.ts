import { isPlatformBrowser } from '@angular/common';
import { computed, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { InspectionSession } from '../models/professional-admin.model';
import { ApiService } from './api';

const STORAGE_KEY = 'saas-web.inspection';

@Injectable({ providedIn: 'root' })
export class ImpersonationService {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly sessionSignal = signal<InspectionSession | null>(this.restore());

  readonly session = this.sessionSignal.asReadonly();
  readonly active = computed(() => !!this.sessionSignal() && !this.expired());
  readonly token = computed(() =>
    this.active() ? (this.sessionSignal()?.inspectionToken ?? null) : null,
  );

  start(targetUserId: string, reason: string): Observable<InspectionSession> {
    return this.api
      .post<InspectionSession>('/admin/impersonation-sessions', { targetUserId, reason })
      .pipe(tap((session) => this.store(session)));
  }

  stop(): void {
    const session = this.sessionSignal();
    this.clear();
    if (session)
      this.api
        .delete<void>(`/admin/impersonation-sessions/${session.id}`)
        .subscribe({ error: () => void 0 });
    void this.router.navigate(['/admin/professionals']);
  }

  clear(): void {
    this.sessionSignal.set(null);
    if (this.browser) sessionStorage.removeItem(STORAGE_KEY);
  }

  remainingSeconds(): number {
    const expiresAt = this.sessionSignal()?.expiresAt;
    return expiresAt
      ? Math.max(0, Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000))
      : 0;
  }

  private expired(): boolean {
    const expiresAt = this.sessionSignal()?.expiresAt;
    if (!expiresAt) return true;
    const expired = new Date(expiresAt).getTime() <= Date.now();
    if (expired) queueMicrotask(() => this.clear());
    return expired;
  }

  private restore(): InspectionSession | null {
    if (!this.browser) return null;
    try {
      const value = sessionStorage.getItem(STORAGE_KEY);
      const session = value ? (JSON.parse(value) as InspectionSession) : null;
      if (!session || new Date(session.expiresAt).getTime() <= Date.now()) {
        sessionStorage.removeItem(STORAGE_KEY);
        return null;
      }
      return session;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
  }

  private store(session: InspectionSession): void {
    this.sessionSignal.set(session);
    if (this.browser) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  }
}

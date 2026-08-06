import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state';
import { UserRole } from '../models/user.model';
import { ImpersonationService } from '../services/impersonation';

const ROLE_DASHBOARD: Record<UserRole, string> = {
  SUPER_ADMIN: '/admin/dashboard/admin',
  ADMIN: '/admin/dashboard/admin',
  RESELLER: '/admin/dashboard/reseller',
  RESELLER_MANAGER: '/admin/dashboard/reseller',
  VOICE_ACTOR: '/admin/dashboard/voice-actor',
  PRODUCER: '/admin/dashboard/producer',
  CLIENT: '/admin/dashboard/client',
};

export const dashboardRedirectGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const appState = inject(AppStateService);
  const router = inject(Router);
  const inspection = inject(ImpersonationService);
  const user = appState.user();

  if (!isPlatformBrowser(platformId)) return true;

  if (!user) return router.createUrlTree(['/auth/login']);

  const route =
    ROLE_DASHBOARD[inspection.effectiveRole() ?? user.role] ?? '/admin/dashboard/client';
  return router.createUrlTree([route]);
};

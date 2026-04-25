import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state';
import { UserRole } from '../models/user.model';

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
  const appState = inject(AppStateService);
  const router = inject(Router);
  const user = appState.user();

  if (!user) return router.createUrlTree(['/auth/login']);

  const route = ROLE_DASHBOARD[user.role] ?? '/admin/dashboard/client';
  return router.createUrlTree([route]);
};

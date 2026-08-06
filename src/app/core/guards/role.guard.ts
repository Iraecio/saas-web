import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state';
import { UserRole } from '../models/user.model';
import { ImpersonationService } from '../services/impersonation';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const platformId = inject(PLATFORM_ID);
    const appState = inject(AppStateService);
    const router = inject(Router);
    const inspection = inject(ImpersonationService);
    const user = appState.user();

    if (!isPlatformBrowser(platformId)) return true;

    if (!user) return router.createUrlTree(['/auth/login']);
    const effectiveRole = inspection.effectiveRole() ?? user.role;
    if (allowedRoles.includes(effectiveRole)) return true;

    return router.createUrlTree(['/admin/dashboard']);
  };
}

import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStateService } from '../services/app-state';
import { UserRole } from '../models/user.model';

export function roleGuard(allowedRoles: UserRole[]): CanActivateFn {
  return () => {
    const platformId = inject(PLATFORM_ID);
    const appState = inject(AppStateService);
    const router = inject(Router);
    const user = appState.user();

    if (!isPlatformBrowser(platformId)) return true;

    if (!user) return router.createUrlTree(['/auth/login']);
    if (allowedRoles.includes(user.role)) return true;

    return router.createUrlTree(['/admin/dashboard']);
  };
}

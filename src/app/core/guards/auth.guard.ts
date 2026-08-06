import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID, inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = () => {
  const platformId = inject(PLATFORM_ID);
  const authService = inject(AuthService);
  const router = inject(Router);

  // O servidor não acessa o localStorage. A decisão de sessão acontece no
  // navegador depois que o APP_INITIALIZER restaura/renova os tokens.
  if (!isPlatformBrowser(platformId)) return true;

  if (authService.isAuthenticated()) return true;

  return router.createUrlTree(['/auth/login']);
};

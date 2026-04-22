import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, shareReplay, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth';
import { NotificationService } from '../services/notification';
import { attachToken, shouldSkip } from './auth.interceptor';

let refreshInFlight: Observable<string> | null = null;

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const canRefresh =
        error.status === 401 && !shouldSkip(req) && auth.refreshToken() !== null;

      if (canRefresh) {
        if (!refreshInFlight) {
          refreshInFlight = auth.refresh().pipe(
            map((tokens) => tokens.accessToken),
            shareReplay({ bufferSize: 1, refCount: false }),
          );

          refreshInFlight.subscribe({
            next: () => (refreshInFlight = null),
            error: () => {
              refreshInFlight = null;
              auth.clearSession();
              router.navigate(['/auth/login']);
            },
          });
        }

        return refreshInFlight.pipe(
          switchMap((newToken) => next(attachToken(req, newToken))),
        );
      }

      if (error.status === 401) {
        auth.clearSession();
        router.navigate(['/auth/login']);
      } else if (error.status >= 500) {
        notify.error('Erro no servidor. Tente novamente.');
      } else if (error.status === 0) {
        notify.error('Sem conexão com o servidor.');
      }

      return throwError(() => error);
    }),
  );
};

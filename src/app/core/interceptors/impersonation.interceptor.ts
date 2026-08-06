import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError } from 'rxjs';
import { ImpersonationService } from '../services/impersonation';

const MUTATING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);

export const impersonationInterceptor: HttpInterceptorFn = (request, next) => {
  const inspection = inject(ImpersonationService);
  const token = inspection.token();
  if (!token) return next(request);
  if (MUTATING_METHODS.has(request.method)) {
    return throwError(
      () =>
        new Error(
          'A inspeção funciona somente em leitura. Volte ao superadmin para alterar dados.',
        ),
    );
  }
  if (request.url.includes('/admin/')) return next(request);
  return next(request.clone({ setHeaders: { 'X-Impersonation-Token': token } }));
};

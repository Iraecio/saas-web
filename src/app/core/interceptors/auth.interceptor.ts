import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

const SKIP_AUTH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (shouldSkip(req)) return next(req);

  const token = inject(AuthService).accessToken();
  if (!token) return next(req);

  return next(attachToken(req, token));
};

export function attachToken<T>(req: HttpRequest<T>, token: string): HttpRequest<T> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

export function shouldSkip(req: HttpRequest<unknown>): boolean {
  return SKIP_AUTH_URLS.some((path) => req.url.includes(path));
}

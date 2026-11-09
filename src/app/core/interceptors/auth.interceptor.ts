import { HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { environment } from '../../../environments/environment';

const SKIP_AUTH_URLS = ['/auth/login', '/auth/register', '/auth/refresh'];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const apiRequest = req.url.startsWith(environment.apiUrl);
  let securedRequest = apiRequest ? req.clone({ withCredentials: true }) : req;
  if (req.url.includes('/auth/refresh')) {
    securedRequest = securedRequest.clone({ setHeaders: { 'X-CSRF-Protection': '1' } });
  }
  if (shouldSkip(req)) return next(securedRequest);

  const token = inject(AuthService).accessToken();
  if (!token) return next(securedRequest);

  return next(attachToken(securedRequest, token));
};

export function attachToken<T>(req: HttpRequest<T>, token: string): HttpRequest<T> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

export function shouldSkip(req: HttpRequest<unknown>): boolean {
  return SKIP_AUTH_URLS.some((path) => req.url.includes(path));
}

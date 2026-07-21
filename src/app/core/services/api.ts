import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // ── User domain methods ──────────────────────────────────────────────────

  listUsers(params?: { role?: string; page?: number; limit?: number }): Observable<User[]> {
    return this.get<PaginatedResponse<User>>('/users', params).pipe(
      map((res) => res.data),
      catchError(this.handleError),
    );
  }

  getUser(id: string): Observable<User> {
    return this.get<User>(`/users/${id}`).pipe(catchError(this.handleError));
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.put<User>(`/users/${id}`, data).pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<void> {
    return this.delete<void>(`/users/${id}`).pipe(catchError(this.handleError));
  }

  listResellerAdmin(): Observable<User[]> {
    return this.get<User[]>('/admin/revendedores').pipe(catchError(this.handleError));
  }

  // ── Generic HTTP methods ─────────────────────────────────────────────────

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http
      .get<T>(`${this.baseUrl}${endpoint}`, { params: this.toHttpParams(params) })
      .pipe(catchError(this.handleError));
  }

  post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .post<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .put<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  patch<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http
      .patch<T>(`${this.baseUrl}${endpoint}`, body)
      .pipe(catchError(this.handleError));
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http
      .delete<T>(`${this.baseUrl}${endpoint}`)
      .pipe(catchError(this.handleError));
  }

  private toHttpParams(params?: Record<string, string | number | boolean>): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();
    for (const [key, value] of Object.entries(params)) {
      httpParams = httpParams.set(key, String(value));
    }
    return httpParams;
  }

  private handleError(error: HttpErrorResponse) {
    const message = error.error?.message ?? error.message ?? 'Erro desconhecido';
    return throwError(() => new Error(message));
  }
}

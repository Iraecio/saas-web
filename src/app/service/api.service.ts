import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { User } from '../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // Users endpoints
  listUsers(params?: { role?: string }): Observable<User[]> {
    return this.get<User[]>('/users', params).pipe(catchError(this.handleError));
  }

  getUser(id: string): Observable<User> {
    return this.get<User>(`/users/${id}`).pipe(catchError(this.handleError));
  }

  createUser(data: Partial<User>): Observable<User> {
    return this.post<User>('/users', data).pipe(catchError(this.handleError));
  }

  updateUser(id: string, data: Partial<User>): Observable<User> {
    return this.put<User>(`/users/${id}`, data).pipe(catchError(this.handleError));
  }

  deleteUser(id: string): Observable<void> {
    return this.delete<void>(`/users/${id}`).pipe(catchError(this.handleError));
  }

  // Private HTTP methods
  private get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}${endpoint}`, { params: this.toHttpParams(params) });
  }

  private post<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}${endpoint}`, body);
  }

  private put<T>(endpoint: string, body: unknown): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}${endpoint}`, body);
  }

  private delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}${endpoint}`);
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

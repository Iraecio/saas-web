import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { UserListItem } from '../models/user.model';

const MOCK_USERS: UserListItem[] = [
  { id: '1', name: 'Ana Silva', email: 'ana@example.com', role: 'admin', createdAt: '2026-03-12', status: 'active' },
  { id: '2', name: 'Bruno Costa', email: 'bruno@example.com', role: 'user', createdAt: '2026-03-08', status: 'active' },
  { id: '3', name: 'Carla Dias', email: 'carla@example.com', role: 'user', createdAt: '2026-02-21', status: 'invited' },
  { id: '4', name: 'Daniel Rocha', email: 'daniel@example.com', role: 'user', createdAt: '2026-01-30', status: 'disabled' },
  { id: '5', name: 'Elisa Matos', email: 'elisa@example.com', role: 'admin', createdAt: '2026-01-15', status: 'active' },
];

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  list(): Observable<UserListItem[]> {
    return of(MOCK_USERS);
  }

  get(id: string): Observable<UserListItem | undefined> {
    return of(MOCK_USERS.find((u) => u.id === id));
  }

  create(data: Partial<UserListItem>): Observable<UserListItem> {
    return this.api.post<UserListItem>('/users', data);
  }

  update(id: string, data: Partial<UserListItem>): Observable<UserListItem> {
    return this.api.put<UserListItem>(`/users/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/users/${id}`);
  }
}

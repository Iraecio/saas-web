import { Injectable, inject } from '@angular/core';
import { Observable, map, throwError } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { User, UserPermission, GrantPermissionDto } from '../../../core/models/user.model';
import { UserListItem, UsersPage } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  list(params?: { role?: string; page?: number; limit?: number }): Observable<UsersPage> {
    return this.api
      .listUsers(params)
      .pipe(
        map((response) => ({ users: this.mapToListItems(response.data), meta: response.meta })),
      );
  }

  get(id: string): Observable<UserListItem | undefined> {
    return this.api.getUser(id).pipe(map((user) => this.mapToListItem(user)));
  }

  getFull(id: string): Observable<User> {
    return this.api.getUser(id);
  }

  create(data: Partial<UserListItem>): Observable<UserListItem> {
    return throwError(
      () => new Error('Criação administrativa de usuários não é suportada pela API.'),
    );
  }

  update(id: string, data: Partial<UserListItem>): Observable<UserListItem> {
    return this.api
      .updateUser(id, data as Partial<User>)
      .pipe(map((user) => this.mapToListItem(user)));
  }

  updateRaw(id: string, data: Record<string, unknown>): Observable<User> {
    return this.api.updateUser(id, data as Partial<User>);
  }

  remove(id: string): Observable<void> {
    return this.api.deleteUser(id);
  }

  grantPermission(userId: string, dto: GrantPermissionDto): Observable<UserPermission> {
    return this.api.post<UserPermission>(`/users/${userId}/permissions`, dto);
  }

  revokePermission(userId: string, permissionName: string): Observable<void> {
    return this.api.delete<void>(`/users/${userId}/permissions/${permissionName}`);
  }

  private mapToListItem(user: User): UserListItem {
    return {
      id: user.id,
      name: user.name ?? '',
      email: user.email,
      role: user.role,
      createdAt: user.createdAt ?? '',
      lastLoginAt: user.lastLoginAt,
      resellerId: user.resellerId,
      status: user.isActive === false ? 'disabled' : 'active',
    };
  }

  private mapToListItems(users: User[]): UserListItem[] {
    return users.map((user) => this.mapToListItem(user));
  }
}

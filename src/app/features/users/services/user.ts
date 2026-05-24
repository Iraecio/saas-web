import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { User, UserPermission, GrantPermissionDto } from '../../../core/models/user.model';
import { UserListItem } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly api = inject(ApiService);

  list(): Observable<UserListItem[]> {
    return this.api.listUsers().pipe(map((users) => this.mapToListItems(users)));
  }

  get(id: string): Observable<UserListItem | undefined> {
    return this.api.getUser(id).pipe(map((user) => this.mapToListItem(user)));
  }

  getFull(id: string): Observable<User> {
    return this.api.getUser(id);
  }

  create(data: Partial<UserListItem>): Observable<UserListItem> {
    return this.api.createUser(data as Partial<User>).pipe(map((user) => this.mapToListItem(user)));
  }

  update(id: string, data: Partial<UserListItem>): Observable<UserListItem> {
    return this.api.updateUser(id, data as Partial<User>).pipe(map((user) => this.mapToListItem(user)));
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
      createdAt: user.createdAt ?? new Date().toISOString(),
      status: user.isActive ? 'active' : user.isActive === false ? 'disabled' : 'invited',
    };
  }

  private mapToListItems(users: User[]): UserListItem[] {
    return users.map((user) => this.mapToListItem(user));
  }
}

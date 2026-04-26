import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { User } from '../../../core/models/user.model';
import { Reseller } from '../models/reseller.model';

@Injectable({ providedIn: 'root' })
export class ResellerService {
  private readonly api = inject(ApiService);

  list(): Observable<Reseller[]> {
    return this.api.get<User[]>('/users', { role: 'RESELLER' }).pipe(
      map((users) => this.mapUsersToResellers(users)),
    );
  }

  private mapUsersToResellers(users: User[]): Reseller[] {
    return users.map((user) => ({
      id: user.id,
      name: user.name ?? '',
      email: user.email,
      phone: '',
      status: (user.isActive ? 'active' : 'inactive') as 'active' | 'inactive' | 'suspended',
      commissionRate: 0,
      totalSales: 0,
      totalCommission: 0,
      createdAt: user.createdAt ?? new Date().toISOString(),
      updatedAt: user.updatedAt ?? new Date().toISOString(),
    }));
  }

  get(id: string): Observable<Reseller> {
    return this.api.get<Reseller>(`/resellers/${id}`);
  }

  create(data: Partial<Reseller>): Observable<Reseller> {
    return this.api.post<Reseller>('/resellers', data);
  }

  update(id: string, data: Partial<Reseller>): Observable<Reseller> {
    return this.api.put<Reseller>(`/resellers/${id}`, data);
  }

  remove(id: string): Observable<void> {
    return this.api.delete<void>(`/resellers/${id}`);
  }
}

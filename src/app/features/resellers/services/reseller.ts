import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { User } from '../../../core/models/user.model';
import { Reseller } from '../models/reseller.model';

@Injectable({ providedIn: 'root' })
export class ResellerService {
  private readonly api = inject(ApiService);

  /** Lista todos os revendedores via GET /admin/revendedores (sem filtro de tenant). */
  list(): Observable<Reseller[]> {
    return this.api.listResellerAdmin().pipe(
      map((users) => users.map((u) => this.mapUserToReseller(u))),
    );
  }

  get(id: string): Observable<Reseller> {
    return this.api.getUser(id).pipe(map((user) => this.mapUserToReseller(user)));
  }

  update(id: string, data: Partial<Reseller>): Observable<Reseller> {
    const userData: Partial<User> = {
      name: data.name,
      email: data.email,
      isActive: data.status === 'active',
    };
    return this.api.updateUser(id, userData).pipe(map((user) => this.mapUserToReseller(user)));
  }

  delete(id: string): Observable<void> {
    return this.api.deleteUser(id);
  }

  private mapUserToReseller(user: User): Reseller {
    return {
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
    };
  }
}

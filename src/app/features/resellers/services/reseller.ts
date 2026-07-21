import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { User } from '../../../core/models/user.model';
import { Reseller } from '../models/reseller.model';

@Injectable({ providedIn: 'root' })
export class ResellerService {
  private readonly api = inject(ApiService);

  list(): Observable<Reseller[]> {
    return this.api.get<any[]>('/admin/revendedores').pipe(
      map((items) => items.map((item) => ({
        id: item.id,
        ownerId: item.ownerId,
        name: item.companyName || item.owner?.name || 'Revenda sem nome',
        email: item.owner?.email || '',
        phone: item.phone || undefined,
        status: item.isActive ? 'active' : 'inactive',
        timezone: item.timezone,
        maxUsers: item.maxUsers,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      } as Reseller))),
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
      createdAt: user.createdAt ?? new Date().toISOString(),
      updatedAt: user.updatedAt ?? new Date().toISOString(),
    };
  }
}

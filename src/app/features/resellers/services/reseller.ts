import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { ApiService } from '../../../service/api.service';
import { User } from '../../../core/models/user.model';
import { Reseller } from '../models/reseller.model';

@Injectable({ providedIn: 'root' })
export class ResellerService {
  private readonly api = inject(ApiService);

  list(): Observable<Reseller[]> {
    return this.api.listUsers({ role: 'RESELLER' }).pipe(
      map((users) => this.mapUsersToResellers(users)),
    );
  }

  get(id: string): Observable<Reseller> {
    return this.api.getUser(id).pipe(map((user) => this.mapUserToReseller(user)));
  }

  create(data: Partial<Reseller>): Observable<Reseller> {
    const userData: Partial<User> = {
      name: data.name,
      email: data.email,
      role: 'RESELLER',
      isActive: data.status === 'active',
    };
    return this.api.createUser(userData).pipe(map((user) => this.mapUserToReseller(user)));
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

  private mapUsersToResellers(users: User[]): Reseller[] {
    return users.map((user) => this.mapUserToReseller(user));
  }
}

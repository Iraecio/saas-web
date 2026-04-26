import { Injectable, inject } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { Reseller } from '../models/reseller.model';

const MOCK_RESELLERS: Reseller[] = [
  {
    id: '1',
    name: 'Tech Solutions Brasil',
    email: 'contact@techsol.com.br',
    phone: '(11) 98765-4321',
    status: 'active',
    commissionRate: 15,
    totalSales: 45000,
    totalCommission: 6750,
    createdAt: '2025-06-15',
    updatedAt: '2026-04-20',
  },
  {
    id: '2',
    name: 'Digital Partners',
    email: 'sales@digitalpartners.com.br',
    phone: '(21) 99876-5432',
    status: 'active',
    commissionRate: 12,
    totalSales: 32000,
    totalCommission: 3840,
    createdAt: '2025-08-22',
    updatedAt: '2026-04-18',
  },
  {
    id: '3',
    name: 'Web Solutions LLC',
    email: 'info@websolutions.com.br',
    phone: '(31) 98765-1234',
    status: 'inactive',
    commissionRate: 10,
    totalSales: 15000,
    totalCommission: 1500,
    createdAt: '2025-09-10',
    updatedAt: '2026-02-14',
  },
  {
    id: '4',
    name: 'Marketing Masters',
    email: 'team@marketingmasters.com.br',
    phone: '(85) 99123-4567',
    status: 'active',
    commissionRate: 18,
    totalSales: 67000,
    totalCommission: 12060,
    createdAt: '2025-05-03',
    updatedAt: '2026-04-19',
  },
  {
    id: '5',
    name: 'Enterprise Distribuidora',
    email: 'contato@enterprise.com.br',
    phone: '(41) 98765-9876',
    status: 'suspended',
    commissionRate: 20,
    totalSales: 89000,
    totalCommission: 17800,
    createdAt: '2025-03-25',
    updatedAt: '2026-01-30',
  },
];

@Injectable({ providedIn: 'root' })
export class ResellerService {
  private readonly api = inject(ApiService);

  list(): Observable<Reseller[]> {
    return this.api.get<Reseller[]>('/resellers').pipe(
      switchMap((resellers) => {
        if (resellers.length === 0 && !environment.production) {
          return of(MOCK_RESELLERS);
        }
        return of(resellers);
      }),
    );
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

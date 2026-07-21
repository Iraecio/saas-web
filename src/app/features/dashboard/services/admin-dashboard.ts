import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { AdminDashboardSummary } from '../../../core/models/admin-dashboard.model';

@Injectable({ providedIn: 'root' })
export class AdminDashboardService {
  private readonly api = inject(ApiService);

  getSummary(params?: { from?: string; to?: string; timezone?: string }): Observable<AdminDashboardSummary> {
    const query: Record<string, string> = {};
    if (params?.from) query['from'] = params.from;
    if (params?.to) query['to'] = params.to;
    if (params?.timezone) query['timezone'] = params.timezone;
    return this.api.get<AdminDashboardSummary>('/admin/dashboard', query);
  }
}

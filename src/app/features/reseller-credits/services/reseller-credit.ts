import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  CreditEmission,
  EmissionsFilters,
  EmissionsReport,
  EmitCreditDto,
} from '../../../core/models/reseller-credit.model';

@Injectable({ providedIn: 'root' })
export class ResellerCreditService {
  private readonly api = inject(ApiService);

  emit(dto: EmitCreditDto): Observable<CreditEmission> {
    return this.api.post<CreditEmission>('/reseller/credits/emit', dto);
  }

  listEmissions(filters?: EmissionsFilters): Observable<EmissionsReport> {
    const params: Record<string, string | number> = {};
    if (filters?.startDate) params['startDate'] = filters.startDate;
    if (filters?.endDate) params['endDate'] = filters.endDate;
    if (filters?.clientId) params['clientId'] = filters.clientId;
    if (filters?.page) params['page'] = filters.page;
    if (filters?.limit) params['limit'] = filters.limit;
    return this.api.get<EmissionsReport>('/reseller/credits/emissions', params);
  }
}

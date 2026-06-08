import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  CompleteWithdrawalDto,
  RejectWithdrawalDto,
  WithdrawalListFilters,
  WithdrawalRequest,
} from '../../../core/models/withdrawal.model';

@Injectable({ providedIn: 'root' })
export class WithdrawalService {
  private readonly api = inject(ApiService);

  request(): Observable<WithdrawalRequest> {
    return this.api.post<WithdrawalRequest>('/withdrawals', {});
  }

  list(filters?: WithdrawalListFilters): Observable<WithdrawalRequest[]> {
    const params: Record<string, string | number> = {};
    if (filters?.status) params['status'] = filters.status;
    if (filters?.page) params['page'] = filters.page;
    if (filters?.limit) params['limit'] = filters.limit;
    return this.api.get<WithdrawalRequest[]>('/withdrawals', params);
  }

  process(id: string): Observable<WithdrawalRequest> {
    return this.api.post<WithdrawalRequest>(`/withdrawals/${id}/process`, {});
  }

  complete(id: string, dto: CompleteWithdrawalDto): Observable<WithdrawalRequest> {
    return this.api.post<WithdrawalRequest>(`/withdrawals/${id}/complete`, dto);
  }

  reject(id: string, dto: RejectWithdrawalDto): Observable<WithdrawalRequest> {
    return this.api.post<WithdrawalRequest>(`/withdrawals/${id}/reject`, dto);
  }
}

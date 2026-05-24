import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  WalletBalance,
  Credit,
  CreditWithContext,
  CreditsListResponse,
  RefundRequest,
  WalletNotification,
  ReportDisputeDto,
  RequestRefundDto,
} from '../../../core/models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletService {
  private readonly api = inject(ApiService);

  getBalance(): Observable<WalletBalance> {
    return this.api.get<WalletBalance>('/wallet/balance');
  }

  listCredits(params?: {
    cursor?: string;
    limit?: number;
    status?: string;
    type?: string;
  }): Observable<CreditsListResponse> {
    const query = new URLSearchParams();
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    const qs = query.toString();
    return this.api.get<CreditsListResponse>(`/wallet/credits${qs ? '?' + qs : ''}`);
  }

  getCreditWithContext(creditId: string): Observable<CreditWithContext> {
    return this.api.get<CreditWithContext>(`/wallet/credits/${creditId}`);
  }

  reportDispute(creditId: string, dto: ReportDisputeDto): Observable<void> {
    return this.api.post<void>(`/wallet/credits/${creditId}/disputes`, dto);
  }

  requestRefund(creditId: string, dto: RequestRefundDto): Observable<void> {
    return this.api.post<void>(`/wallet/credits/${creditId}/refunds`, dto);
  }

  listRefunds(params?: { status?: string; cursor?: string; limit?: number }): Observable<RefundRequest[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.cursor) query.set('cursor', params.cursor);
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.api.get<RefundRequest[]>(`/wallet/refunds${qs ? '?' + qs : ''}`);
  }

  getNotifications(): Observable<WalletNotification[]> {
    return this.api.get<WalletNotification[]>('/wallet/notifications');
  }
}

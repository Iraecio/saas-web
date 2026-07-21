import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  WalletSummary,
  CreditWithContext,
  Credit,
  ReconciliationResult,
  Dispute,
  UpdateDisputeDto,
  RefundRequest,
  WalletAuditLogEntry,
  WalletAnalytics,
  IssueCreditDto,
  CancelCreditDto,
} from '../../../core/models/wallet.model';

@Injectable({ providedIn: 'root' })
export class WalletAdminService {
  private readonly api = inject(ApiService);

  listWallets(params?: {
    offset?: number;
    limit?: number;
    userId?: string;
  }): Observable<WalletSummary[]> {
    const query = new URLSearchParams();
    if (params?.offset !== undefined) query.set('offset', String(params.offset));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.userId) query.set('userId', params.userId);
    const qs = query.toString();
    return this.api.get<WalletSummary[]>(`/wallet/admin/wallets${qs ? '?' + qs : ''}`);
  }

  getWalletDetails(userId: string): Observable<WalletSummary> {
    return this.api.get<WalletSummary>(`/wallet/admin/wallets/${userId}`);
  }

  searchCredits(params?: {
    status?: string;
    type?: string;
    originType?: string;
    userId?: string;
    offset?: number;
    limit?: number;
  }): Observable<Credit[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.originType) query.set('originType', params.originType);
    if (params?.userId) query.set('userId', params.userId);
    if (params?.offset !== undefined) query.set('offset', String(params.offset));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.api.get<Credit[]>(`/wallet/admin/credits${qs ? '?' + qs : ''}`);
  }

  getReconciliationResults(params?: {
    walletId?: string;
    offset?: number;
    limit?: number;
  }): Observable<ReconciliationResult[]> {
    const query = new URLSearchParams();
    if (params?.walletId) query.set('walletId', params.walletId);
    if (params?.offset !== undefined) query.set('offset', String(params.offset));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.api.get<ReconciliationResult[]>(`/wallet/admin/reconciliation${qs ? '?' + qs : ''}`);
  }

  correctReconciliation(id: string, reason: string): Observable<void> {
    return this.api.patch<void>(`/wallet/admin/reconciliation/${id}/correct`, { reason });
  }

  listDisputes(params?: {
    status?: string;
    offset?: number;
    limit?: number;
  }): Observable<Dispute[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.offset !== undefined) query.set('offset', String(params.offset));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.api.get<Dispute[]>(`/wallet/admin/disputes${qs ? '?' + qs : ''}`);
  }

  updateDispute(id: string, dto: UpdateDisputeDto): Observable<Dispute> {
    return this.api.patch<Dispute>(`/wallet/admin/disputes/${id}`, dto);
  }

  listAllRefunds(params?: {
    status?: string;
    offset?: number;
    limit?: number;
  }): Observable<RefundRequest[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.offset !== undefined) query.set('offset', String(params.offset));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.api.get<RefundRequest[]>(`/wallet/admin/refunds${qs ? '?' + qs : ''}`);
  }

  approveRefund(id: string, notes?: string): Observable<void> {
    return this.api.patch<void>(`/wallet/admin/refunds/${id}/approve`, { notes });
  }

  rejectRefund(id: string, reason: string): Observable<void> {
    return this.api.patch<void>(`/wallet/admin/refunds/${id}/reject`, { reason });
  }

  getAuditLog(params?: {
    walletId?: string;
    creditId?: string;
    action?: string;
    offset?: number;
    limit?: number;
  }): Observable<WalletAuditLogEntry[]> {
    const query = new URLSearchParams();
    if (params?.walletId) query.set('walletId', params.walletId);
    if (params?.creditId) query.set('creditId', params.creditId);
    if (params?.action) query.set('action', params.action);
    if (params?.offset !== undefined) query.set('offset', String(params.offset));
    if (params?.limit) query.set('limit', String(params.limit));
    const qs = query.toString();
    return this.api.get<WalletAuditLogEntry[]>(`/wallet/admin/audit-log${qs ? '?' + qs : ''}`);
  }

  getAnalytics(params?: { from?: string; to?: string }): Observable<WalletAnalytics> {
    const query = new URLSearchParams();
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const qs = query.toString();
    return this.api.get<WalletAnalytics>(`/wallet/admin/analytics${qs ? '?' + qs : ''}`);
  }

  issueCredits(dto: IssueCreditDto): Observable<Credit> {
    return this.api.post<Credit>('/wallet/admin/issue', dto);
  }

  cancelCredits(dto: CancelCreditDto): Observable<void> {
    return this.api.post<void>('/wallet/admin/cancel', dto);
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
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
import {
  AdminWalletDetail,
  AdminWalletOverview,
  AdminWalletPage,
  AdminWalletQuery,
  AdminWalletSummary,
} from '../../../core/models/wallet-admin.model';
import { User } from '../../../core/models/user.model';

@Injectable({ providedIn: 'root' })
export class WalletAdminService {
  private readonly api = inject(ApiService);

  listWallets(params?: Partial<AdminWalletQuery>): Observable<AdminWalletPage> {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params ?? {})) {
      if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
    }
    const qs = query.toString();
    return this.api
      .get<
        AdminWalletPage | { items: AdminWalletSummary[]; total: number } | AdminWalletSummary[]
      >(`/wallet/admin/wallets${qs ? '?' + qs : ''}`)
      .pipe(
        map((response) => this.normalizeWalletPage(response, params)),
        switchMap((page) => this.enrichMissingOwners(page)),
      );
  }

  getWalletDetails(userId: string): Observable<AdminWalletDetail> {
    return this.api.get<AdminWalletDetail>(`/wallet/admin/wallets/${userId}`).pipe(
      map((wallet) => ({
        ...wallet,
        ...this.normalizeWallet({ ...wallet, userId: wallet.userId ?? userId }),
      })),
      switchMap((wallet) => this.enrichWalletOwner(wallet)),
    );
  }

  getOverview(params?: { from?: string; to?: string }): Observable<AdminWalletOverview> {
    const query = new URLSearchParams();
    if (params?.from) query.set('from', params.from);
    if (params?.to) query.set('to', params.to);
    const qs = query.toString();
    return this.api
      .get<AdminWalletOverview>(`/wallet/admin/overview${qs ? '?' + qs : ''}`)
      .pipe(catchError(() => this.getLegacyOverview(params)));
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
    return this.api.get<ReconciliationResult[]>(
      `/wallet/admin/reconciliation${qs ? '?' + qs : ''}`,
    );
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

  exportWallets(params: Partial<AdminWalletQuery>): Observable<Blob> {
    const rows = Object.entries(params)
      .filter(([, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => `${key},${JSON.stringify(value)}`)
      .join('\n');
    return new Observable((subscriber) => {
      subscriber.next(new Blob([`Filtro,Valor\n${rows}`], { type: 'text/csv;charset=utf-8' }));
      subscriber.complete();
    });
  }

  private normalizeWalletPage(
    response:
      | AdminWalletPage
      | { items: AdminWalletSummary[]; total: number }
      | AdminWalletSummary[],
    params?: Partial<AdminWalletQuery>,
  ): AdminWalletPage {
    const rawItems = Array.isArray(response) ? response : response.items;
    const items = rawItems.map((item: any) => this.normalizeWallet(item));
    const total = Array.isArray(response) ? items.length : response.total;
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 20;
    const supplied = !Array.isArray(response) ? (response as Partial<AdminWalletPage>) : {};
    return {
      items,
      total,
      page: supplied.page ?? page,
      pageSize: supplied.pageSize ?? pageSize,
      totalPages: supplied.totalPages ?? Math.max(1, Math.ceil(total / pageSize)),
      totals: supplied.totals ?? {
        wallets: total,
        availableCredits: items.reduce((sum, item) => sum + item.availableCredits, 0),
        frozenCredits: items.reduce((sum, item) => sum + item.frozenCredits, 0),
        expiredCredits: items.reduce((sum, item) => sum + item.expiredCredits, 0),
        expiringCredits: items.reduce((sum, item) => sum + item.expiringCredits, 0),
        discrepancies: items.filter((item) => item.hasDiscrepancy).length,
        pendingActions: items.reduce((sum, item) => sum + item.pendingCount, 0),
      },
      queryFingerprint: supplied.queryFingerprint,
    };
  }

  private getLegacyOverview(params?: {
    from?: string;
    to?: string;
  }): Observable<AdminWalletOverview> {
    return forkJoin({
      wallets: this.listWallets({ page: 1, pageSize: 100 }),
      analytics: this.getAnalytics(params),
    }).pipe(
      map(({ wallets, analytics }) => {
        const roles = new Map<string, { count: number; balance: number }>();
        for (const wallet of wallets.items) {
          const current = roles.get(wallet.role) ?? { count: 0, balance: 0 };
          current.count += 1;
          current.balance += wallet.availableCredits;
          roles.set(wallet.role, current);
        }
        return {
          ...wallets.totals,
          ...analytics,
          byRole: Array.from(roles, ([role, values]) => ({
            role: role as AdminWalletSummary['role'],
            ...values,
          })),
        };
      }),
    );
  }

  private enrichMissingOwners(page: AdminWalletPage): Observable<AdminWalletPage> {
    const walletsWithoutOwner = page.items.filter(
      (wallet) =>
        wallet.ownerName === 'Usuário sem nome' || wallet.ownerEmail === 'E-mail não informado',
    );

    if (walletsWithoutOwner.length === 0) return of(page);

    return forkJoin(walletsWithoutOwner.map((wallet) => this.enrichWalletOwner(wallet))).pipe(
      map((enrichedWallets) => {
        const enrichedById = new Map(enrichedWallets.map((wallet) => [wallet.walletId, wallet]));
        return {
          ...page,
          items: page.items.map((wallet) => enrichedById.get(wallet.walletId) ?? wallet),
        };
      }),
    );
  }

  private enrichWalletOwner<T extends AdminWalletSummary>(wallet: T): Observable<T> {
    if (wallet.ownerName !== 'Usuário sem nome' && wallet.ownerEmail !== 'E-mail não informado') {
      return of(wallet);
    }

    return this.api.get<User>(`/users/${wallet.userId}`).pipe(
      map(
        (user): T => ({
          ...wallet,
          ownerName: user.name?.trim() || user.email || 'Usuário sem nome',
          ownerEmail: user.email || 'E-mail não informado',
          role: user.role,
          accountStatus: user.isActive === false ? ('BLOCKED' as const) : wallet.accountStatus,
          resellerId: user.resellerId ?? wallet.resellerId,
        }),
      ),
      catchError(() => of(wallet)),
    );
  }

  private normalizeWallet(item: any): AdminWalletSummary {
    return {
      ...item,
      id: item.walletId ?? item.id,
      walletId: item.walletId ?? item.id,
      ownerName: item.ownerName ?? item.user?.name ?? 'Usuário sem nome',
      ownerEmail: item.ownerEmail ?? item.user?.email ?? 'E-mail não informado',
      role: item.role ?? item.user?.role ?? 'CLIENT',
      accountStatus: item.accountStatus ?? (item.user?.isActive === false ? 'BLOCKED' : 'ACTIVE'),
      expiringCredits: item.expiringCredits ?? 0,
      pendingCount: item.pendingCount ?? 0,
      hasDiscrepancy: item.hasDiscrepancy ?? false,
      lastMovementAt: item.lastMovementAt ?? item.updatedAt ?? item.createdAt,
      updatedAt: item.updatedAt ?? item.createdAt,
      version: item.version ?? item.updatedAt ?? item.createdAt,
    };
  }
}

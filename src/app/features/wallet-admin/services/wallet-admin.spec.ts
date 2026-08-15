import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { WalletAdminService } from './wallet-admin';

describe('WalletAdminService contracts', () => {
  let service: WalletAdminService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiService, WalletAdminService],
    });
    service = TestBed.inject(WalletAdminService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('PATCHes refund approval', () => {
    service.approveRefund('r').subscribe();
    const request = http.expectOne(`${environment.apiUrl}/wallet/admin/refunds/r/approve`);
    expect(request.request.method).toBe('PATCH');
    request.flush({});
  });
  it('uses audit-log offset pagination', () => {
    service.getAuditLog({ offset: 20 }).subscribe();
    http.expectOne(`${environment.apiUrl}/wallet/admin/audit-log?offset=20`).flush([]);
  });
  it('uses official issue endpoint', () => {
    service
      .issueCredits({
        toUserId: 'u',
        amount: 1,
        valueCents: 1,
        costCents: 0,
        type: 'PAID',
        originType: 'PURCHASE',
      })
      .subscribe();
    http.expectOne(`${environment.apiUrl}/wallet/admin/issue`).flush({});
  });

  it('uses paginated wallet query and enriches legacy responses', () => {
    let total = 0;
    service.listWallets({ page: 2, pageSize: 20, role: 'CLIENT' }).subscribe((page) => {
      total = page.total;
      expect(page.items[0].ownerName).toBe('Marina Alves');
    });
    const request = http.expectOne(
      `${environment.apiUrl}/wallet/admin/wallets?page=2&pageSize=20&role=CLIENT`,
    );
    request.flush({
      items: [
        {
          id: 'w-1',
          userId: 'u-1',
          availableCredits: 12,
          frozenCredits: 2,
          expiredCredits: 0,
          totalReceived: 14,
          totalSpent: 2,
          totalRefunded: 0,
          currency: 'BRL',
          createdAt: '2026-08-01T00:00:00Z',
          updatedAt: '2026-08-02T00:00:00Z',
          user: { name: 'Marina Alves', email: 'marina@example.com', role: 'CLIENT' },
        },
      ],
      total: 1,
    });
    expect(total).toBe(1);
  });

  it('loads the owner when a legacy wallet response does not include user data', () => {
    let owner: { name: string; email: string } | undefined;
    service.listWallets({ page: 1, pageSize: 20 }).subscribe((page) => {
      owner = {
        name: page.items[0].ownerName,
        email: page.items[0].ownerEmail,
      };
    });

    http.expectOne(`${environment.apiUrl}/wallet/admin/wallets?page=1&pageSize=20`).flush({
      items: [
        {
          id: 'w-owner',
          userId: 'u-owner',
          availableCredits: 12,
          frozenCredits: 0,
          expiredCredits: 0,
          totalReceived: 12,
          totalSpent: 0,
          totalRefunded: 0,
          currency: 'BRL',
          createdAt: '2026-08-01T00:00:00Z',
          updatedAt: '2026-08-02T00:00:00Z',
        },
      ],
      total: 1,
    });
    http.expectOne(`${environment.apiUrl}/users/u-owner`).flush({
      id: 'u-owner',
      name: 'Luana Ribeiro',
      email: 'luana@example.com',
      role: 'VOICE_ACTOR',
      isActive: true,
    });

    expect(owner).toEqual({ name: 'Luana Ribeiro', email: 'luana@example.com' });
  });

  it('uses the consolidated overview endpoint', () => {
    service.getOverview().subscribe();
    http.expectOne(`${environment.apiUrl}/wallet/admin/overview`).flush({});
  });

  it('falls back to legacy wallet and analytics endpoints when overview is unavailable', () => {
    let result: { wallets: number; totalIssued: number } | undefined;
    service.getOverview().subscribe((overview) => (result = overview));
    http
      .expectOne(`${environment.apiUrl}/wallet/admin/overview`)
      .flush(
        { message: 'Cannot GET /v1/wallet/admin/overview' },
        { status: 404, statusText: 'Not Found' },
      );
    http
      .expectOne(`${environment.apiUrl}/wallet/admin/wallets?page=1&pageSize=100`)
      .flush({ items: [], total: 12 });
    http.expectOne(`${environment.apiUrl}/wallet/admin/analytics`).flush({
      totalIssued: 80,
      totalSpent: 20,
      totalRefunded: 3,
      totalExpired: 2,
    });
    expect(result?.wallets).toBe(12);
    expect(result?.totalIssued).toBe(80);
  });
});

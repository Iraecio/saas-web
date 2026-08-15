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

  it('uses the consolidated overview endpoint', () => {
    service.getOverview().subscribe();
    http.expectOne(`${environment.apiUrl}/wallet/admin/overview`).flush({});
  });
});

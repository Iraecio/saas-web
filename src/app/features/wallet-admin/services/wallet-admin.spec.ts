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
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), ApiService, WalletAdminService] });
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
    service.issueCredits({ toUserId: 'u', amount: 1, valueCents: 1, costCents: 0, type: 'PAID', originType: 'PURCHASE' }).subscribe();
    http.expectOne(`${environment.apiUrl}/wallet/admin/issue`).flush({});
  });
});

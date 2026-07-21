import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { WalletService } from './wallet';

describe('WalletService contracts', () => {
  let service: WalletService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), ApiService, WalletService] });
    service = TestBed.inject(WalletService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses unified wallet', () => {
    service.getWallet().subscribe();
    http.expectOne(`${environment.apiUrl}/wallet`).flush({});
  });
  it('uses official dispute path', () => {
    service.reportDispute('c', { reason: 'x' }).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/wallet/disputes/c`);
    expect(request.request.method).toBe('POST');
    request.flush({});
  });
  it('uses cursor pagination', () => {
    service.listCredits({ cursor: 'c' }).subscribe();
    http.expectOne(`${environment.apiUrl}/wallet/credits?cursor=c`).flush({ items: [] });
  });
});

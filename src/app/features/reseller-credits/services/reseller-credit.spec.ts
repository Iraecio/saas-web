import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { ResellerCreditService } from './reseller-credit';

describe('ResellerCreditService contracts', () => {
  let service: ResellerCreditService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), ApiService, ResellerCreditService] });
    service = TestBed.inject(ResellerCreditService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('purchases stock', () => {
    service.purchase(100).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/reseller/credits/purchase`);
    expect(request.request.body).toEqual({ creditAmount: 100 });
    request.flush({});
  });
  it('sells stock', () => {
    service.sell({ clientId: 'c', creditAmount: 10 }).subscribe();
    http.expectOne(`${environment.apiUrl}/reseller/credits/sell`).flush({});
  });
});

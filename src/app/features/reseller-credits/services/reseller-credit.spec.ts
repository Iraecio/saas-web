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
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService,
        ResellerCreditService,
      ],
    });
    service = TestBed.inject(ResellerCreditService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('purchases stock', () => {
    service.purchase(100, 'configuration-1').subscribe();
    const request = http.expectOne(`${environment.apiUrl}/reseller/credits/payment`);
    expect(request.request.body).toEqual({
      creditAmount: 100,
      configurationId: 'configuration-1',
    });
    request.flush({});
  });

  it('lists active platform payment methods', () => {
    service.listPlatformPaymentMethods().subscribe();
    http.expectOne(`${environment.apiUrl}/payment-methods?context=PLATFORM_RESELLER`).flush([]);
  });

  it('lists and loads platform purchase payment transactions', () => {
    service.listPaymentTransactions().subscribe();
    http
      .expectOne(
        `${environment.apiUrl}/payment-transactions?context=PLATFORM_RESELLER&page=1&limit=50`,
      )
      .flush({ items: [], total: 0 });

    service.getPaymentTransaction('transaction-1').subscribe();
    http.expectOne(`${environment.apiUrl}/payment-transactions/transaction-1`).flush({});
  });

  it('unwraps the current platform price returned to the reseller', () => {
    let receivedPrice: { unitPriceCents: number } | null | undefined;
    service.getPlatformPrice().subscribe((price) => (receivedPrice = price));

    http.expectOne(`${environment.apiUrl}/reseller/credit-price`).flush({
      current: {
        unitPriceCents: 125,
        effectiveFrom: '2026-07-31T12:00:00.000Z',
        note: null,
      },
    });

    expect(receivedPrice?.unitPriceCents).toBe(125);
  });

  it('returns null when the platform has no current price', () => {
    let receivedPrice: unknown = undefined;
    service.getPlatformPrice().subscribe((price) => (receivedPrice = price));

    http.expectOne(`${environment.apiUrl}/reseller/credit-price`).flush({ current: null });

    expect(receivedPrice).toBeNull();
  });
  it('sells stock', () => {
    service.sell({ clientId: 'c', creditAmount: 10 }).subscribe();
    http.expectOne(`${environment.apiUrl}/reseller/credits/sell`).flush({});
  });
});

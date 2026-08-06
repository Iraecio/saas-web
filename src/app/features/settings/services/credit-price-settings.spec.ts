import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { CreditPriceSettingsService } from './credit-price-settings';

describe('CreditPriceSettingsService', () => {
  let service: CreditPriceSettingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService,
        CreditPriceSettingsService,
      ],
    });
    service = TestBed.inject(CreditPriceSettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the current platform price and its history', () => {
    service.getOverview().subscribe();
    const request = http.expectOne(`${environment.apiUrl}/admin/credit-price?page=1&limit=50`);
    expect(request.request.method).toBe('GET');
    request.flush({ current: null, history: { items: [], total: 0 } });
  });

  it('creates an append-only price period using the API contract', () => {
    const dto = {
      unitPriceCents: 125,
      effectiveFrom: '2026-08-01T12:00:00.000Z',
      note: 'Reajuste comercial',
    };
    service.setPrice(dto).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/admin/credit-price`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dto);
    request.flush({});
  });
});

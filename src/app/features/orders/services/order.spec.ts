import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { OrderService } from './order';

describe('OrderService line items', () => {
  let service: OrderService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiService, OrderService],
    });
    service = TestBed.inject(OrderService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('creates items JSON', () => {
    const data = { items: [{ serviceId: 's' }] };
    service.create(data).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/orders`);
    expect(request.request.body).toEqual(data);
    request.flush({});
  });
  it('accepts selected item', () => {
    service.accept('o', 'i').subscribe();
    http.expectOne(`${environment.apiUrl}/orders/o/line-items/i/accept`).flush({});
  });
  it('loads item history', () => {
    service.getHistory('o', 'i').subscribe();
    http.expectOne(`${environment.apiUrl}/orders/o/line-items/i/history`).flush([]);
  });
  it('loads item pronunciations and protected audio access', () => {
    service.listPronunciations('o', 'i').subscribe();
    http.expectOne(`${environment.apiUrl}/orders/o/line-items/i/pronunciations`).flush([]);
    service.pronunciationAudioAccess('o', 'i', 'p', 'v').subscribe();
    http
      .expectOne(
        `${environment.apiUrl}/orders/o/line-items/i/pronunciations/p/versions/v/audio-access`,
      )
      .flush({ signedUrl: 'url', expiresAt: 'date' });
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { DEFAULT_ORDER_ADMIN_QUERY } from '../../../core/models/order-admin.model';
import { ApiService } from '../../../core/services/api';
import { OrderAdminService } from './order-admin';

describe('OrderAdminService', () => {
  let service: OrderAdminService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ApiService, OrderAdminService],
    });
    service = TestBed.inject(OrderAdminService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('envia consulta global paginada', () => {
    service.list({ ...DEFAULT_ORDER_ADMIN_QUERY, q: 'maria', status: 'DISPUTED' }).subscribe();
    const request = http.expectOne(
      (candidate) =>
        candidate.url === `${environment.apiUrl}/orders/admin` &&
        candidate.params.get('q') === 'maria' &&
        candidate.params.get('status') === 'DISPUTED' &&
        candidate.params.get('page') === '1',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ items: [], total: 0, page: 1, limit: 25, totalPages: 0 });
  });

  it('carrega detalhe administrativo', () => {
    service.getById('order-1').subscribe();
    const request = http.expectOne(`${environment.apiUrl}/orders/admin/order-1`);
    expect(request.request.method).toBe('GET');
    request.flush({ id: 'order-1' });
  });
});

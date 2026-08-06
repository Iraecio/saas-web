import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { ServiceNegotiationService } from './service-negotiation';

describe('ServiceNegotiationService', () => {
  let service: ServiceNegotiationService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService,
        ServiceNegotiationService,
      ],
    });
    service = TestBed.inject(ServiceNegotiationService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('serializes the manager queue filters', () => {
    service
      .list({ page: 2, pageSize: 20, nextActor: 'MANAGER', professionalRole: 'VOICE_ACTOR' })
      .subscribe();
    http
      .expectOne(
        `${environment.apiUrl}/professional-pricing/negotiations?page=2&pageSize=20&nextActor=MANAGER&professionalRole=VOICE_ACTOR`,
      )
      .flush({ items: [], page: 2, pageSize: 20, total: 0, counters: {} });
  });

  it('loads an aggregate negotiation detail', () => {
    service.detail('neg-1').subscribe();
    http.expectOne(`${environment.apiUrl}/professional-pricing/negotiations/neg-1`).flush({});
  });

  it('uses the official accept, reject and counter mutation paths', () => {
    const base = `${environment.apiUrl}/professionals/pro-1/services/svc-1/negotiations/neg-1`;

    service.accept('pro-1', 'svc-1', 'neg-1').subscribe();
    const accept = http.expectOne(`${base}/accept`);
    expect(accept.request.method).toBe('POST');
    accept.flush({});

    service.reject('pro-1', 'svc-1', 'neg-1', 'Fora do orçamento').subscribe();
    const reject = http.expectOne(`${base}/reject`);
    expect(reject.request.body).toEqual({ notes: 'Fora do orçamento' });
    reject.flush({});

    service.counter('pro-1', 'svc-1', 'neg-1', 27500, 'Proposta intermediária').subscribe();
    const counter = http.expectOne(`${base}/counter`);
    expect(counter.request.body).toEqual({
      proposedPriceCents: 27500,
      notes: 'Proposta intermediária',
    });
    counter.flush({});
  });
});

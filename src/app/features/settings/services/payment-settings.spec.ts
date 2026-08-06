import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { PaymentSettingsService } from './payment-settings';

describe('PaymentSettingsService', () => {
  let service: PaymentSettingsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        ApiService,
        PaymentSettingsService,
      ],
    });
    service = TestBed.inject(PaymentSettingsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the superadmin policy and configuration contracts', () => {
    service.listPolicies('SUPER_ADMIN').subscribe();
    http.expectOne(`${environment.apiUrl}/admin/payment-method-policies`).flush([]);

    service.listConfigurations('SUPER_ADMIN').subscribe();
    http.expectOne(`${environment.apiUrl}/admin/payment-configurations`).flush([]);
  });

  it('uses the reseller-scoped contracts', () => {
    service.listPolicies('RESELLER').subscribe();
    http.expectOne(`${environment.apiUrl}/reseller/payment-method-policies`).flush([]);

    service.listConfigurations('RESELLER_MANAGER').subscribe();
    http.expectOne(`${environment.apiUrl}/reseller/payment-configurations`).flush([]);
  });

  it('omits no fields from the create payload', () => {
    const dto = {
      policyId: 'policy-1',
      name: 'PIX principal',
      priority: 1,
      currency: 'BRL',
      publicConfig: { pixKey: 'financeiro@example.com' },
      credentials: { token: 'secret' },
    };
    service.createConfiguration('RESELLER', dto).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/reseller/payment-configurations`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dto);
    request.flush({});
  });

  it('uses patch for updates and posts state actions', () => {
    service
      .updateConfiguration('SUPER_ADMIN', 'config-1', {
        name: 'Conta principal',
        publicConfig: { instructions: 'Pague na conta indicada' },
      })
      .subscribe();
    const updateRequest = http.expectOne(
      `${environment.apiUrl}/admin/payment-configurations/config-1`,
    );
    expect(updateRequest.request.method).toBe('PATCH');
    updateRequest.flush({});

    service.validateConfiguration('RESELLER', 'config-1').subscribe();
    http
      .expectOne(`${environment.apiUrl}/reseller/payment-configurations/config-1/validate`)
      .flush({});

    service.activateConfiguration('RESELLER', 'config-1').subscribe();
    http
      .expectOne(`${environment.apiUrl}/reseller/payment-configurations/config-1/activate`)
      .flush({});
  });

  it('requires a reason payload when suspending platform configuration', () => {
    service.suspendConfiguration('config-1', 'Credencial expirada').subscribe();
    const request = http.expectOne(
      `${environment.apiUrl}/admin/payment-configurations/config-1/suspend`,
    );
    expect(request.request.body).toEqual({ reason: 'Credencial expirada' });
    request.flush({});
  });

  it('deactivates a platform configuration without deleting its history', () => {
    service.deactivateConfiguration('config-1').subscribe();
    const request = http.expectOne(
      `${environment.apiUrl}/admin/payment-configurations/config-1/deactivate`,
    );
    expect(request.request.method).toBe('POST');
    request.flush({});
  });
});

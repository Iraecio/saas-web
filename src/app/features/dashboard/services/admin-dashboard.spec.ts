import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import { AdminDashboardService } from './admin-dashboard';

describe('AdminDashboardService', () => {
  let service: AdminDashboardService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), ApiService, AdminDashboardService] });
    service = TestBed.inject(AdminDashboardService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads one official aggregate', () => {
    service.getSummary({ timezone: 'America/Cuiaba' }).subscribe();
    http.expectOne(`${environment.apiUrl}/admin/dashboard?timezone=America/Cuiaba`).flush({});
  });
});

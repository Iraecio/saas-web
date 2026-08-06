import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  NegotiationFilters,
  NegotiationPage,
  ServiceNegotiationDetail,
  ServiceNegotiationStep,
} from '../../../core/models/service-negotiation.model';
import { ApiService } from '../../../core/services/api';

@Injectable({ providedIn: 'root' })
export class ServiceNegotiationService {
  private readonly api = inject(ApiService);

  list(filters: NegotiationFilters = {}): Observable<NegotiationPage> {
    return this.api.get<NegotiationPage>('/professional-pricing/negotiations', {
      page: filters.page,
      pageSize: filters.pageSize,
      status: filters.status || undefined,
      nextActor: filters.nextActor || undefined,
      professionalRole: filters.professionalRole || undefined,
      serviceId: filters.serviceId || undefined,
      search: filters.search?.trim() || undefined,
    });
  }

  detail(negotiationId: string): Observable<ServiceNegotiationDetail> {
    return this.api.get<ServiceNegotiationDetail>(
      `/professional-pricing/negotiations/${negotiationId}`,
    );
  }

  accept(professionalId: string, serviceId: string, negotiationId: string, notes?: string) {
    return this.api.post<ServiceNegotiationStep>(
      this.actionPath(professionalId, serviceId, negotiationId, 'accept'),
      { notes },
    );
  }

  reject(professionalId: string, serviceId: string, negotiationId: string, notes: string) {
    return this.api.post<ServiceNegotiationStep>(
      this.actionPath(professionalId, serviceId, negotiationId, 'reject'),
      { notes },
    );
  }

  counter(
    professionalId: string,
    serviceId: string,
    negotiationId: string,
    proposedPriceCents: number,
    notes?: string,
  ) {
    return this.api.post<{
      countered: ServiceNegotiationStep;
      newProposal: ServiceNegotiationStep;
    }>(this.actionPath(professionalId, serviceId, negotiationId, 'counter'), {
      proposedPriceCents,
      notes,
    });
  }

  private actionPath(
    professionalId: string,
    serviceId: string,
    negotiationId: string,
    action: string,
  ): string {
    return `/professionals/${professionalId}/services/${serviceId}/negotiations/${negotiationId}/${action}`;
  }
}

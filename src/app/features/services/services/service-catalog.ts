import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  CreateServiceDto,
  Service,
  ServiceAuditEntry,
  ServiceListFilters,
  UpdateServiceDto,
} from '../../../core/models/service.model';

// Campos cuja alteração exige confirmação de impacto (FR-004 / saas-api 006 FR-011).
const CRITICAL_FIELDS: (keyof UpdateServiceDto)[] = [
  'creditCost',
  'defaultDeliveryHours',
  'maxRevisions',
];

@Injectable({ providedIn: 'root' })
export class ServiceCatalogService {
  private readonly api = inject(ApiService);

  list(filters?: ServiceListFilters): Observable<Service[]> {
    const params: Record<string, string | number | boolean> = {};
    if (filters?.professionalRole) params['professionalRole'] = filters.professionalRole;
    if (filters?.ownerId) params['ownerId'] = filters.ownerId;
    if (filters?.includeInactive) params['includeInactive'] = filters.includeInactive;
    return this.api.get<Service[]>('/services', params);
  }

  getById(id: string): Observable<Service> {
    return this.api.get<Service>(`/services/${id}`);
  }

  create(dto: CreateServiceDto): Observable<Service> {
    return this.api.post<Service>('/services', dto);
  }

  /**
   * Anexa `confirmImpact: true` automaticamente quando o DTO altera algum
   * campo crítico, evitando o 422 de confirmação da API.
   */
  update(id: string, dto: UpdateServiceDto): Observable<Service> {
    const touchesCritical = CRITICAL_FIELDS.some((f) => dto[f] !== undefined);
    const body = touchesCritical ? { ...dto, confirmImpact: true } : dto;
    return this.api.put<Service>(`/services/${id}`, body);
  }

  deactivate(id: string): Observable<{ message: string }> {
    return this.api.delete<{ message: string }>(`/services/${id}`);
  }

  activate(id: string): Observable<Service> {
    return this.api.patch<Service>(`/services/${id}/activate`, {});
  }

  getAudit(id: string): Observable<ServiceAuditEntry[]> {
    return this.api.get<ServiceAuditEntry[]>(`/services/${id}/audit`);
  }
}

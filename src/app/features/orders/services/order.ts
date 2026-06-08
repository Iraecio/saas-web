import { HttpClient, HttpEvent } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api';
import {
  CreateOrderDto,
  DeliverDto,
  InstructionsDto,
  JustificationDto,
  Order,
  OrderListFilters,
  OrderStatusHistoryEntry,
  ReasonDto,
  ResolveDisputeDto,
  UpdateBriefDto,
} from '../../../core/models/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly api = inject(ApiService);
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  // ── Consulta ───────────────────────────────────────────────────────────────
  list(filters?: OrderListFilters): Observable<Order[]> {
    const params: Record<string, string | number> = {};
    if (filters?.status) params['status'] = filters.status;
    if (filters?.orderType) params['orderType'] = filters.orderType;
    if (filters?.startDate) params['startDate'] = filters.startDate;
    if (filters?.endDate) params['endDate'] = filters.endDate;
    if (filters?.page) params['page'] = filters.page;
    if (filters?.limit) params['limit'] = filters.limit;
    return this.api.get<Order[]>('/orders', params);
  }

  getById(id: string): Observable<Order> {
    return this.api.get<Order>(`/orders/${id}`);
  }

  getHistory(id: string): Observable<OrderStatusHistoryEntry[]> {
    return this.api.get<OrderStatusHistoryEntry[]>(`/orders/${id}/history`);
  }

  // ── Criação ──────────────────────────────────────────────────────────────
  // VOICE → JSON; PRODUCTION (com arquivo) → multipart com progresso.
  create(dto: CreateOrderDto): Observable<HttpEvent<Order>> {
    const form = new FormData();
    form.append('professionalId', dto.professionalId);
    form.append('serviceId', dto.serviceId);
    form.append('orderType', dto.orderType);
    form.append('briefingText', dto.briefingText);
    if (dto.file) form.append('file', dto.file);
    return this.http.post<Order>(`${this.baseUrl}/orders`, form, {
      reportProgress: true,
      observe: 'events',
    });
  }

  // ── Ações do profissional ──────────────────────────────────────────────────
  requestBriefRevision(id: string, dto: ReasonDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/request-brief-revision`, dto);
  }

  accept(id: string): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/accept`, {});
  }

  refuse(id: string, dto: ReasonDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/refuse`, dto);
  }

  // Entrega / re-entrega — sempre multipart (arquivo obrigatório).
  deliver(id: string, dto: DeliverDto): Observable<HttpEvent<Order>> {
    const form = new FormData();
    form.append('file', dto.file);
    if (dto.deliveryNotes) form.append('deliveryNotes', dto.deliveryNotes);
    if (dto.redeliveryReason) form.append('redeliveryReason', dto.redeliveryReason);
    return this.http.post<Order>(`${this.baseUrl}/orders/${id}/deliver`, form, {
      reportProgress: true,
      observe: 'events',
    });
  }

  // ── Ações do cliente ─────────────────────────────────────────────────────
  updateBrief(id: string, dto: UpdateBriefDto): Observable<HttpEvent<Order>> {
    const form = new FormData();
    form.append('briefingText', dto.briefingText);
    if (dto.file) form.append('file', dto.file);
    return this.http.post<Order>(`${this.baseUrl}/orders/${id}/update-brief`, form, {
      reportProgress: true,
      observe: 'events',
    });
  }

  approve(id: string): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/approve`, {});
  }

  requestRevision(id: string, dto: InstructionsDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/request-revision`, dto);
  }

  dispute(id: string, dto: JustificationDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/dispute`, dto);
  }

  cancel(id: string): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/cancel`, {});
  }

  // ── Resolução de disputa (ADMIN/RESELLER) ────────────────────────────────
  resolve(id: string, dto: ResolveDisputeDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/resolve`, dto);
  }
}

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
import {
  OrderPronunciation,
  OrderPronunciationVersion,
  PronunciationAudioAccess,
} from '../../../core/models/pronunciation.model';

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

  getHistory(id: string, itemId: string): Observable<OrderStatusHistoryEntry[]> {
    return this.api.get<OrderStatusHistoryEntry[]>(`/orders/${id}/line-items/${itemId}/history`);
  }

  listPronunciations(id: string, itemId: string): Observable<OrderPronunciation[]> {
    return this.api.get<OrderPronunciation[]>(`/orders/${id}/line-items/${itemId}/pronunciations`);
  }

  pronunciationHistory(
    id: string,
    itemId: string,
    instructionId: string,
  ): Observable<OrderPronunciationVersion[]> {
    return this.api.get<OrderPronunciationVersion[]>(
      `/orders/${id}/line-items/${itemId}/pronunciations/${instructionId}/history`,
    );
  }

  pronunciationAudioAccess(
    id: string,
    itemId: string,
    instructionId: string,
    versionId: string,
  ): Observable<PronunciationAudioAccess> {
    return this.api.get<PronunciationAudioAccess>(
      `/orders/${id}/line-items/${itemId}/pronunciations/${instructionId}/versions/${versionId}/audio-access`,
    );
  }

  // ── Criação ──────────────────────────────────────────────────────────────
  create(dto: CreateOrderDto): Observable<HttpEvent<Order>> {
    return this.http.post<Order>(`${this.baseUrl}/orders`, dto, {
      reportProgress: true,
      observe: 'events',
    });
  }

  // ── Ações do profissional ──────────────────────────────────────────────────
  requestBriefRevision(id: string, itemId: string, dto: ReasonDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/line-items/${itemId}/request-brief-revision`, dto);
  }

  accept(id: string, itemId: string): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/line-items/${itemId}/accept`, {});
  }

  refuse(id: string, itemId: string, dto: ReasonDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/line-items/${itemId}/refuse`, dto);
  }

  // Entrega / re-entrega — sempre multipart (arquivo obrigatório).
  deliver(id: string, itemId: string, dto: DeliverDto): Observable<HttpEvent<Order>> {
    const form = new FormData();
    form.append('file', dto.file);
    if (dto.deliveryNotes) form.append('deliveryNotes', dto.deliveryNotes);
    if (dto.redeliveryReason) form.append('redeliveryReason', dto.redeliveryReason);
    return this.http.post<Order>(
      `${this.baseUrl}/orders/${id}/line-items/${itemId}/deliver`,
      form,
      {
        reportProgress: true,
        observe: 'events',
      },
    );
  }

  // ── Ações do cliente ─────────────────────────────────────────────────────
  updateBrief(id: string, itemId: string, dto: UpdateBriefDto): Observable<HttpEvent<Order>> {
    const form = new FormData();
    form.append('briefingText', dto.briefingText);
    if (dto.file) form.append('file', dto.file);
    return this.http.post<Order>(
      `${this.baseUrl}/orders/${id}/line-items/${itemId}/update-brief`,
      form,
      {
        reportProgress: true,
        observe: 'events',
      },
    );
  }

  approve(id: string, itemId: string): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/line-items/${itemId}/approve`, {});
  }

  requestRevision(id: string, itemId: string, dto: InstructionsDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/line-items/${itemId}/request-revision`, dto);
  }

  dispute(id: string, itemId: string, dto: JustificationDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/line-items/${itemId}/dispute`, dto);
  }

  cancel(id: string, itemId: string): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/line-items/${itemId}/cancel`, {});
  }

  // ── Resolução de disputa (ADMIN/RESELLER) ────────────────────────────────
  resolve(id: string, itemId: string, dto: ResolveDisputeDto): Observable<Order> {
    return this.api.post<Order>(`/orders/${id}/line-items/${itemId}/resolve`, dto);
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  OrderAdminOrder,
  OrderAdminPage,
  OrderAdminQuery,
} from '../../../core/models/order-admin.model';

@Injectable({ providedIn: 'root' })
export class OrderAdminService {
  private readonly api = inject(ApiService);

  list(query: OrderAdminQuery): Observable<OrderAdminPage> {
    return this.api.get<OrderAdminPage>('/orders/admin', {
      q: query.q || undefined,
      status: query.status || undefined,
      orderType: query.orderType || undefined,
      origin: query.origin || undefined,
      overdue: query.overdue || undefined,
      startDate: query.startDate || undefined,
      endDate: query.endDate || undefined,
      sort: query.sort,
      direction: query.direction,
      page: query.page,
      limit: query.limit,
    });
  }

  getById(id: string): Observable<OrderAdminOrder> {
    return this.api.get<OrderAdminOrder>(`/orders/admin/${id}`);
  }
}

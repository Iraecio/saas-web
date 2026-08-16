import { Injectable } from '@angular/core';
import { ParamMap, Params } from '@angular/router';
import {
  DEFAULT_ORDER_ADMIN_QUERY,
  OrderAdminQuery,
  OrderAdminSort,
  OrderOrigin,
} from '../../../core/models/order-admin.model';
import { OrderStatus, OrderType } from '../../../core/models/order.model';

const STATUSES: OrderStatus[] = [
  'BLOCKED',
  'AWAITING_ASSIGNMENT',
  'PENDING',
  'AWAITING_BRIEF',
  'IN_PROGRESS',
  'REVIEW',
  'COMPLETED',
  'CANCELLED',
  'DISPUTED',
];
const TYPES: OrderType[] = ['VOICE', 'PRODUCTION'];
const ORIGINS: OrderOrigin[] = ['PLATFORM', 'RESELLER'];
const SORTS: OrderAdminSort[] = ['createdAt', 'updatedAt', 'deadlineAt', 'totalCredits'];

@Injectable({ providedIn: 'root' })
export class OrderAdminQueryService {
  parse(params: ParamMap): OrderAdminQuery {
    const number = (key: string, fallback: number, allowed?: number[]) => {
      const value = Number(params.get(key));
      if (!Number.isInteger(value) || value < 1) return fallback;
      return allowed && !allowed.includes(value) ? fallback : value;
    };
    const enumValue = <T extends string>(key: string, values: T[], fallback: T | '') => {
      const value = params.get(key) as T | null;
      return value && values.includes(value) ? value : fallback;
    };
    return {
      q: (params.get('q') ?? '').slice(0, 120),
      status: enumValue('status', STATUSES, ''),
      orderType: enumValue('orderType', TYPES, ''),
      origin: enumValue('origin', ORIGINS, ''),
      overdue: params.get('overdue') === 'true',
      startDate: params.get('startDate') ?? '',
      endDate: params.get('endDate') ?? '',
      sort: enumValue('sort', SORTS, DEFAULT_ORDER_ADMIN_QUERY.sort) as OrderAdminSort,
      direction: params.get('direction') === 'asc' ? 'asc' : 'desc',
      page: number('page', 1),
      limit: number('limit', 25, [25, 50, 100]),
    };
  }

  serialize(query: OrderAdminQuery): Params {
    return {
      q: query.q || null,
      status: query.status || null,
      orderType: query.orderType || null,
      origin: query.origin || null,
      overdue: query.overdue || null,
      startDate: query.startDate || null,
      endDate: query.endDate || null,
      sort: query.sort === 'createdAt' ? null : query.sort,
      direction: query.direction === 'desc' ? null : query.direction,
      page: query.page === 1 ? null : query.page,
      limit: query.limit === 25 ? null : query.limit,
    };
  }
}

import { convertToParamMap } from '@angular/router';
import { describe, expect, it } from 'vitest';
import { DEFAULT_ORDER_ADMIN_QUERY } from '../../../core/models/order-admin.model';
import { OrderAdminQueryService } from './order-admin-query';

describe('OrderAdminQueryService', () => {
  const service = new OrderAdminQueryService();

  it('aplica defaults seguros a parâmetros inválidos', () => {
    const query = service.parse(
      convertToParamMap({ status: 'UNKNOWN', page: '-2', limit: '999', direction: 'sideways' }),
    );
    expect(query).toEqual(DEFAULT_ORDER_ADMIN_QUERY);
  });

  it('preserva uma consulta válida no round-trip', () => {
    const params = convertToParamMap({
      q: 'cliente',
      status: 'DISPUTED',
      orderType: 'VOICE',
      origin: 'RESELLER',
      overdue: 'true',
      startDate: '2026-08-01',
      endDate: '2026-08-16',
      sort: 'updatedAt',
      direction: 'asc',
      page: '3',
      limit: '50',
    });
    const query = service.parse(params);
    expect(query.status).toBe('DISPUTED');
    expect(query.page).toBe(3);
    expect(query.limit).toBe(50);
    expect(service.serialize(query)['q']).toBe('cliente');
  });

  it('limita a busca a 120 caracteres', () => {
    expect(service.parse(convertToParamMap({ q: 'a'.repeat(200) })).q).toHaveLength(120);
  });
});

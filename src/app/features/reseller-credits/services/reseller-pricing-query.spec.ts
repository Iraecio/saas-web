import { describe, expect, it } from 'vitest';
import { ResellerPricingQueryService } from './reseller-pricing-query';

describe('ResellerPricingQueryService', () => {
  const service = new ResellerPricingQueryService();
  it('aplica defaults seguros a parâmetros inválidos', () => {
    expect(service.fromParams({ page: '-2', pageSize: '999', status: 'bad' })).toMatchObject({
      page: 1,
      pageSize: 10,
      status: 'all',
    });
  });
  it('preserva consulta válida no round-trip', () => {
    const query = service.fromParams({
      q: 'premium',
      status: 'active',
      sort: 'priceCents',
      direction: 'asc',
      page: '2',
      pageSize: '25',
    });
    expect(service.fromParams(service.toParams(query))).toEqual(query);
  });
});

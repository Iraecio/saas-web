import { describe, expect, it } from 'vitest';
import { WalletAdminQueryService } from './wallet-admin-query';

describe('WalletAdminQueryService', () => {
  const service = new WalletAdminQueryService();

  it('restores supported filters and clamps pagination', () => {
    const query = service.fromParams({
      search: 'maria',
      role: 'CLIENT',
      hasReservations: 'true',
      page: '-2',
      pageSize: '999',
    });
    expect(query.search).toBe('maria');
    expect(query.role).toBe('CLIENT');
    expect(query.hasReservations).toBe(true);
    expect(query.page).toBe(1);
    expect(query.pageSize).toBe(20);
  });

  it('omits empty values from shareable query params', () => {
    const params = service.toParams(service.fromParams({ role: 'PRODUCER', page: '2' }));
    expect(params['role']).toBe('PRODUCER');
    expect(params['page']).toBe(2);
    expect(params['search']).toBeUndefined();
  });

  it('starts with a safe explicit empty selection', () => {
    expect(service.emptySelection()).toEqual({
      mode: 'EXPLICIT',
      walletIds: [],
      excludedIds: [],
      count: 0,
    });
  });
});

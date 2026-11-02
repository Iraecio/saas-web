import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { AdminWalletQuery, WalletBulkSelection } from '../../../core/models/wallet-admin.model';

export const DEFAULT_WALLET_QUERY: AdminWalletQuery = {
  search: '',
  role: '',
  status: '',
  resellerId: '',
  balanceMin: null,
  balanceMax: null,
  hasReservations: null,
  hasDiscrepancy: null,
  expiringWithinDays: null,
  sort: 'lastMovementAt',
  direction: 'desc',
  page: 1,
  pageSize: 20,
};

@Injectable({ providedIn: 'root' })
export class WalletAdminQueryService {
  fromParams(params: Params): AdminWalletQuery {
    const number = (value: unknown): number | null => {
      if (value === undefined || value === null || value === '') return null;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : null;
    };
    const boolean = (value: unknown): boolean | null =>
      value === 'true' ? true : value === 'false' ? false : null;
    return {
      ...DEFAULT_WALLET_QUERY,
      search: String(params['search'] ?? ''),
      role: params['role'] ?? '',
      status: params['status'] ?? '',
      resellerId: String(params['resellerId'] ?? ''),
      balanceMin: number(params['balanceMin']),
      balanceMax: number(params['balanceMax']),
      hasReservations: boolean(params['hasReservations']),
      hasDiscrepancy: boolean(params['hasDiscrepancy']),
      expiringWithinDays: number(params['expiringWithinDays']),
      sort: params['sort'] ?? DEFAULT_WALLET_QUERY.sort,
      direction: params['direction'] === 'asc' ? 'asc' : 'desc',
      page: Math.max(1, number(params['page']) ?? 1),
      pageSize: [20, 50, 100].includes(number(params['pageSize']) ?? 20)
        ? (number(params['pageSize']) ?? 20)
        : 20,
    };
  }

  toParams(query: AdminWalletQuery): Params {
    const entries = Object.entries(query).filter(([, value]) => value !== '' && value !== null);
    return Object.fromEntries(entries);
  }

  emptySelection(): WalletBulkSelection {
    return { mode: 'EXPLICIT', walletIds: [], excludedIds: [], count: 0 };
  }
}

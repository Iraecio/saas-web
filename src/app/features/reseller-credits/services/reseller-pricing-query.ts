import { Injectable } from '@angular/core';
import { Params } from '@angular/router';
import { PackageQuery } from '../../../core/models/reseller-credit.model';

export const DEFAULT_PACKAGE_QUERY: PackageQuery = {
  q: '',
  status: 'all',
  sort: 'updatedAt',
  direction: 'desc',
  page: 1,
  pageSize: 10,
};

@Injectable({ providedIn: 'root' })
export class ResellerPricingQueryService {
  fromParams(params: Params): PackageQuery {
    const page = Math.max(1, Number(params['page']) || 1);
    const size = Number(params['pageSize']);
    return {
      q: String(params['q'] ?? ''),
      status: ['active', 'inactive'].includes(params['status']) ? params['status'] : 'all',
      sort: ['name', 'creditAmount', 'priceCents'].includes(params['sort'])
        ? params['sort']
        : 'updatedAt',
      direction: params['direction'] === 'asc' ? 'asc' : 'desc',
      page,
      pageSize: ([10, 25, 50].includes(size) ? size : 10) as 10 | 25 | 50,
    };
  }
  toParams(query: PackageQuery): Params {
    return Object.fromEntries(
      Object.entries(query).filter(([, value]) => value !== '' && value !== 'all'),
    );
  }
}

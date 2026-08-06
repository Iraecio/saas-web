import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  PlatformCreditPrice,
  PlatformCreditPriceOverview,
  SetPlatformCreditPriceDto,
} from '../../../core/models/credit-price.model';
import { ApiService } from '../../../core/services/api';

@Injectable({ providedIn: 'root' })
export class CreditPriceSettingsService {
  private readonly api = inject(ApiService);

  getOverview(page = 1, limit = 50): Observable<PlatformCreditPriceOverview> {
    return this.api.get<PlatformCreditPriceOverview>('/admin/credit-price', { page, limit });
  }

  setPrice(dto: SetPlatformCreditPriceDto): Observable<PlatformCreditPrice> {
    return this.api.post<PlatformCreditPrice>('/admin/credit-price', dto);
  }
}

import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import { CreditPackage, CreditPurchase, CreditSale, PaginatedResult, PlatformCreditPrice, ResellerPricing, StockSummary } from '../../../core/models/reseller-credit.model';

@Injectable({ providedIn: 'root' })
export class ResellerCreditService {
  private readonly api = inject(ApiService);
  getPlatformPrice(): Observable<PlatformCreditPrice> { return this.api.get('/reseller/credit-price'); }
  getPricing(): Observable<ResellerPricing> { return this.api.get('/reseller/pricing'); }
  updatePricing(dto: { unitPriceCents: number; allowDirectPurchase: boolean }): Observable<ResellerPricing> { return this.api.put('/reseller/pricing', dto); }
  createPackage(dto: { creditAmount: number; priceCents: number }): Observable<CreditPackage> { return this.api.post('/reseller/pricing/packages', dto); }
  togglePackage(id: string, isActive: boolean): Observable<CreditPackage> { return this.api.patch(`/reseller/pricing/packages/${id}`, { isActive }); }
  purchase(creditAmount: number): Observable<CreditPurchase> { return this.api.post('/reseller/credits/purchase', { creditAmount }); }
  listPurchases(params?: { page?: number; limit?: number; status?: string }): Observable<PaginatedResult<CreditPurchase> | CreditPurchase[]> { return this.api.get('/reseller/credits/purchases', params); }
  listAdminPurchases(params?: { page?: number; limit?: number; status?: string; resellerId?: string }): Observable<PaginatedResult<CreditPurchase> | CreditPurchase[]> { return this.api.get('/admin/credit-purchases', params); }
  confirmPurchase(id: string, paymentReference?: string): Observable<CreditPurchase> { return this.api.post(`/admin/credit-purchases/${id}/confirm`, { paymentReference }); }
  cancelPurchase(id: string, reason: string): Observable<CreditPurchase> { return this.api.post(`/admin/credit-purchases/${id}/cancel`, { reason }); }
  getStock(): Observable<StockSummary> { return this.api.get('/reseller/stock'); }
  sell(dto: { clientId: string; creditAmount?: number; packageId?: string }): Observable<CreditSale> { return this.api.post('/reseller/credits/sell', dto); }
  listSales(params?: { page?: number; limit?: number; clientId?: string; startDate?: string; endDate?: string }): Observable<PaginatedResult<CreditSale> | CreditSale[]> { return this.api.get('/reseller/credits/sales', params); }
}

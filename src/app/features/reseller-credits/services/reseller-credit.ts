import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  CreditPackage,
  CreditPurchase,
  CreditSale,
  CurrentPlatformCreditPriceResponse,
  PaginatedResult,
  PaymentTransaction,
  PaymentTransactionResult,
  PlatformCreditPrice,
  PlatformPaymentMethod,
  ResellerPricing,
  StockSummary,
  StockManagementView,
  StockMovementType,
} from '../../../core/models/reseller-credit.model';

@Injectable({ providedIn: 'root' })
export class ResellerCreditService {
  private readonly api = inject(ApiService);
  getPlatformPrice(): Observable<PlatformCreditPrice | null> {
    return this.api
      .get<CurrentPlatformCreditPriceResponse>('/reseller/credit-price')
      .pipe(map((response) => response.current ?? null));
  }
  getPricing(): Observable<ResellerPricing> {
    return this.api.get('/reseller/pricing');
  }
  updatePricing(dto: {
    unitPriceCents: number;
    allowDirectPurchase: boolean;
  }): Observable<ResellerPricing> {
    return this.api.put('/reseller/pricing', dto);
  }
  createPackage(dto: { creditAmount: number; priceCents: number }): Observable<CreditPackage> {
    return this.api.post('/reseller/pricing/packages', dto);
  }
  togglePackage(id: string, isActive: boolean): Observable<CreditPackage> {
    return this.api.patch(`/reseller/pricing/packages/${id}`, { isActive });
  }
  listPlatformPaymentMethods(): Observable<PlatformPaymentMethod[]> {
    return this.api.get('/payment-methods', { context: 'PLATFORM_RESELLER' });
  }
  purchase(creditAmount: number, configurationId: string): Observable<PaymentTransaction> {
    return this.api.post('/reseller/credits/payment', { creditAmount, configurationId });
  }
  submitPaymentProof(transactionId: string, file: File): Observable<PaymentTransaction> {
    const body = new FormData();
    body.append('file', file);
    return this.api.post(`/payment-transactions/${transactionId}/proof`, body);
  }
  listPaymentTransactions(page = 1, limit = 50): Observable<PaymentTransactionResult> {
    return this.api.get('/payment-transactions', {
      context: 'PLATFORM_RESELLER',
      page,
      limit,
    });
  }
  getPaymentTransaction(id: string): Observable<PaymentTransaction> {
    return this.api.get(`/payment-transactions/${id}`);
  }
  approvePaymentTransaction(id: string): Observable<PaymentTransaction> {
    return this.api.post(`/payment-transactions/${id}/approve`, {});
  }
  rejectPaymentTransaction(id: string, reason: string): Observable<PaymentTransaction> {
    return this.api.post(`/payment-transactions/${id}/reject`, { reason });
  }
  getPaymentProofUrl(transactionId: string, proofId: string): Observable<string> {
    return this.api
      .get<{ signedUrl: string }>(`/payment-transactions/${transactionId}/proofs/${proofId}/url`)
      .pipe(map((response) => response.signedUrl));
  }
  sendPaymentMessage(transactionId: string, message: string): Observable<PaymentTransaction> {
    return this.api.post(`/payment-transactions/${transactionId}/messages`, { message });
  }
  listPurchases(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Observable<PaginatedResult<CreditPurchase> | CreditPurchase[]> {
    return this.api.get('/reseller/credits/purchases', params);
  }
  listAdminPurchases(params?: {
    page?: number;
    limit?: number;
    status?: string;
    resellerId?: string;
  }): Observable<PaginatedResult<CreditPurchase> | CreditPurchase[]> {
    return this.api.get('/admin/credit-purchases', params);
  }
  confirmPurchase(id: string, paymentReference?: string): Observable<CreditPurchase> {
    return this.api.post(`/admin/credit-purchases/${id}/confirm`, { paymentReference });
  }
  cancelPurchase(id: string, reason: string): Observable<CreditPurchase> {
    return this.api.post(`/admin/credit-purchases/${id}/cancel`, { reason });
  }
  getStock(): Observable<StockSummary> {
    return this.api.get('/reseller/stock');
  }
  getStockManagement(params?: {
    page?: number;
    limit?: number;
    type?: StockMovementType | '';
    search?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<StockManagementView> {
    return this.api.get('/reseller/stock/management', params);
  }
  sell(dto: {
    clientId: string;
    creditAmount?: number;
    packageId?: string;
  }): Observable<CreditSale> {
    return this.api.post('/reseller/credits/sell', dto);
  }
  listSales(params?: {
    page?: number;
    limit?: number;
    clientId?: string;
    startDate?: string;
    endDate?: string;
  }): Observable<PaginatedResult<CreditSale> | CreditSale[]> {
    return this.api.get('/reseller/credits/sales', params);
  }
}

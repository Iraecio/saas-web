export interface PlatformCreditPrice { unitPriceCents: number; effectiveFrom: string; note?: string | null; }
export interface ResellerPricing { id?: string; unitPriceCents: number; allowDirectPurchase: boolean; packages: CreditPackage[]; }
export interface CreditPackage { id: string; creditAmount: number; priceCents: number; isActive: boolean; }
export interface CreditPurchase { id: string; resellerId: string; creditAmount: number; unitPriceCents: number; totalCents: number; status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED'; paymentReference?: string | null; createdAt: string; }
export interface StockLot { id: string; sourceType: string; initialCredits: number; remainingCredits: number; unitCostCents: number; createdAt: string; }
export interface StockSummary { totalAvailable: number; lots: StockLot[]; }
export interface CreditSale { id: string; resellerId: string; clientId: string; creditAmount: number; unitSalePriceCents: number; totalSaleCents: number; totalCostCents: number; marginCents: number; createdAt: string; }
export interface PaginatedResult<T> { data?: T[]; items?: T[]; meta?: { page: number; limit: number; total: number; totalPages: number }; }

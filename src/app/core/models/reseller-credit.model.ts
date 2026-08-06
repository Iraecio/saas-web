export interface PlatformCreditPrice {
  unitPriceCents: number;
  effectiveFrom: string;
  note?: string | null;
}
export interface CurrentPlatformCreditPriceResponse {
  current?: PlatformCreditPrice | null;
}
export interface ResellerPricing {
  id?: string;
  unitPriceCents: number;
  allowDirectPurchase: boolean;
  packages: CreditPackage[];
}
export interface CreditPackage {
  id: string;
  creditAmount: number;
  priceCents: number;
  isActive: boolean;
}
export interface CreditPurchase {
  id: string;
  resellerId: string;
  creditAmount: number;
  unitPriceCents: number;
  totalCents: number;
  status: 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED';
  paymentReference?: string | null;
  createdAt: string;
  confirmedAt?: string | null;
  cancelledAt?: string | null;
  cancelReason?: string | null;
  requestedById?: string;
  reseller?: {
    companyName: string;
    owner?: { name?: string | null; email: string };
  };
}
export type PaymentTransactionStatus =
  | 'CREATED'
  | 'AWAITING_PAYMENT'
  | 'AWAITING_REVIEW'
  | 'PROCESSING'
  | 'PAID'
  | 'DECLINED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'DIVERGENT'
  | 'REFUNDED'
  | 'DISPUTED';
export interface PlatformPaymentMethod {
  id: string;
  name: string;
  currency: string;
  priority: number;
  publicConfig: Record<string, unknown>;
  policy: { providerCode: string; displayName: string; methodType: 'MANUAL' | 'PIX' | 'PROVIDER' };
}
export interface PaymentTransaction {
  id: string;
  creditPurchaseId?: string | null;
  amountCents: number;
  currency: string;
  status: PaymentTransactionStatus;
  configuration: PlatformPaymentMethod;
  configurationSnapshot: Record<string, unknown>;
  events: PaymentTransactionEvent[];
  proofs?: PaymentProof[];
  messages?: PaymentMessage[];
  createdAt: string;
  payer?: { name?: string | null; email: string };
}
export interface PaymentMessage {
  id: string;
  message: string;
  createdAt: string;
  author: { id: string; name?: string | null; email: string; role: string };
}
export interface PaymentTransactionEvent {
  id?: string;
  type?: string;
  reason?: string | null;
  payload?: Record<string, unknown> | null;
  createdAt?: string;
  occurredAt?: string;
}
export interface PaymentProof {
  id: string;
  status: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  createdAt: string;
  reviewReason?: string | null;
}
export interface PaymentTransactionResult {
  items: PaymentTransaction[];
  total: number;
}
export interface StockLot {
  id: string;
  sourceType: string;
  initialCredits: number;
  remainingCredits: number;
  unitCostCents: number;
  createdAt: string;
}
export interface StockSummary {
  totalAvailable: number;
  totalStock?: number;
  reservedCredits?: number;
  lots: StockLot[];
}
export type StockMovementType = 'ENTRY' | 'EXIT' | 'RESERVATION' | 'RELEASE' | 'CONSUMPTION';
export interface StockPaymentSummary {
  transactionId: string;
  status: string;
  amountCents: number;
  currency: string;
  paidAt?: string | null;
  providerPaymentId?: string | null;
  configurationName: string;
  method: string;
  methodType: string;
  proofs?: { id: string; originalName: string; status: string; createdAt: string }[];
}
export interface StockMovement {
  id: string;
  type: StockMovementType;
  occurredAt: string;
  credits: number;
  title: string;
  lotId?: string;
  referenceType?: string | null;
  referenceId?: string | null;
  status?: string;
  expiresAt?: string;
  person?: { id: string; name?: string | null; email: string };
  financial?: { unitCents: number; totalCents: number; costCents?: number; marginCents?: number };
  payment?: StockPaymentSummary | null;
  lots?: { stockLotId: string; creditAmount: number; unitCostCents: number }[];
}
export interface StockManagementView {
  summary: {
    totalAvailable: number;
    totalStock: number;
    reservedCredits: number;
    totalReceived: number;
    totalSold: number;
    revenueCents: number;
    marginCents: number;
  };
  movements: {
    items: StockMovement[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  lots: (StockLot & {
    purchaseId?: string | null;
    referenceType?: string | null;
    referenceId?: string | null;
    purchase?: { id: string; status: string; totalCents: number } | null;
  })[];
}
export interface CreditSale {
  id: string;
  resellerId: string;
  clientId: string;
  creditAmount: number;
  unitSalePriceCents: number;
  totalSaleCents: number;
  totalCostCents: number;
  marginCents: number;
  createdAt: string;
}
export interface PaginatedResult<T> {
  data?: T[];
  items?: T[];
  meta?: { page: number; limit: number; total: number; totalPages: number };
}

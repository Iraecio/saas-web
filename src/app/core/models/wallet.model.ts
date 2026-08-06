// ── Enums ────────────────────────────────────────────────────────────────────
export type CreditStatus = 'AVAILABLE' | 'FROZEN' | 'SPENT' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';
export type CreditType = 'PAID' | 'PROMOTIONAL' | 'EARNED' | 'BONUS';
export type CreditOriginType =
  | 'PURCHASE'
  | 'SERVICE_PAYMENT'
  | 'ADJUSTMENT'
  | 'PROMOTION'
  | 'BONUS';
export type CreditEventType =
  | 'ISSUED'
  | 'TRANSFERRED'
  | 'FROZEN'
  | 'UNFROZEN'
  | 'SPENT'
  | 'REFUNDED'
  | 'CANCELLED'
  | 'EXPIRED'
  | 'DISPUTED';
export type RefundStatus =
  | 'REQUESTED'
  | 'APPROVED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED';
export type DisputeStatus = 'OPENED' | 'INVESTIGATING' | 'RESOLVED' | 'CHARGEBACK_FILED';

// Mantido para contratos históricos de serviço/pedido; a carteira do usuário é única.
export type WalletType = 'PLATFORM' | 'RESELLER';

// ── Wallet ────────────────────────────────────────────────────────────────────
export interface WalletBalance {
  availableCredits: number;
  frozenCredits: number;
  expiredCredits: number;
}

export interface Wallet {
  id: string;
  userId: string;
  resellerId?: string | null;
  availableCredits: number;
  frozenCredits: number;
  expiredCredits: number;
  totalReceived: number;
  totalSpent: number;
  totalRefunded: number;
  currency: string;
  createdAt: string;
  balanceSource?: 'RESELLER_STOCK';
}

export type WalletSummary = Wallet;

// ── Credits ───────────────────────────────────────────────────────────────────
export interface Credit {
  id: string;
  walletId: string;
  valueCents: number;
  costCents: number;
  status: CreditStatus;
  type: CreditType;
  originType: CreditOriginType;
  expiresAt?: string | null;
  issuedAt: string;
}

export interface CreditEvent {
  id: string;
  creditId: string;
  eventType: CreditEventType;
  amount?: number;
  note?: string | null;
  triggeredById: string;
  createdAt: string;
}

export interface CreditWithContext extends Credit {
  events: CreditEvent[];
  disputes: Dispute[];
}

export interface CreditsListResponse {
  items: Credit[];
  nextCursor?: string | null;
}

// ── Disputes ──────────────────────────────────────────────────────────────────
export interface Dispute {
  id: string;
  creditId: string;
  reason: string;
  status: DisputeStatus;
  reportedBy: string;
  investigatedBy?: string | null;
  investigationNotes?: string | null;
  resolution?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ReportDisputeDto {
  reason: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateDisputeDto {
  status?: DisputeStatus;
  investigationNotes?: string;
  resolution?: string;
}

// ── Refunds ───────────────────────────────────────────────────────────────────
export interface RefundRequest {
  id: string;
  creditId: string;
  walletId: string;
  reason: string;
  status: RefundStatus;
  requestedBy: string;
  processedBy?: string | null;
  note?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestRefundDto {
  reason: string;
  note?: string;
}

// ── Notifications ─────────────────────────────────────────────────────────────
export interface WalletNotification {
  type: 'EXPIRING_SOON' | 'FROZEN' | 'DISPUTE_UPDATE' | 'REFUND_UPDATE';
  message: string;
  creditId?: string;
  createdAt: string;
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export interface IssueCreditDto {
  toUserId: string;
  amount: number;
  valueCents: number;
  costCents: number;
  type: CreditType;
  originType: CreditOriginType;
  expiresInDays?: number;
  metadata?: { description?: string };
}

export interface CancelCreditDto {
  creditIds: string[];
  reason: string;
}

export interface ReconciliationResult {
  id: string;
  walletId: string;
  isBalanced: boolean;
  discrepancy?: number | null;
  createdAt: string;
}

export interface WalletAnalytics {
  totalIssued: number;
  totalSpent: number;
  totalRefunded: number;
  totalExpired: number;
}

export interface WalletAuditLogEntry {
  id: string;
  walletId?: string;
  creditId?: string;
  action: string;
  performedBy: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

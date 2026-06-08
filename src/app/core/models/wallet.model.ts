// ── Enums ────────────────────────────────────────────────────────────────────
export type CreditStatus = 'AVAILABLE' | 'FROZEN' | 'SPENT' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';
export type CreditType = 'PAID' | 'PROMOTIONAL' | 'EARNED' | 'BONUS';
export type CreditOriginType = 'PURCHASE' | 'SERVICE_PAYMENT' | 'ADJUSTMENT' | 'PROMOTION' | 'BONUS';
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

// Tipo da carteira no modelo de dupla carteira (spec 002 / saas-api 004).
// Fonte única para 'PLATFORM' | 'RESELLER' — reutilizado por service.model e order.model.
export type WalletType = 'PLATFORM' | 'RESELLER';

// ── Wallet ────────────────────────────────────────────────────────────────────
export interface WalletBalance {
  balance: number;
  currency: string;
}

// Carteira do modelo de dupla carteira: GET /v1/wallet/platform | /v1/wallet/reseller
export interface Wallet {
  id: string;
  walletType: WalletType;
  availableCredits: number;
  frozenCredits: number;
  currency: string;
}

export interface WalletSummary {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  creditCount: number;
  createdAt: string;
}

// ── Credits ───────────────────────────────────────────────────────────────────
export interface Credit {
  id: string;
  walletId: string;
  amount: number;
  status: CreditStatus;
  type: CreditType;
  originType: CreditOriginType;
  expiresAt?: string | null;
  createdAt: string;
  updatedAt: string;
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
  hasMore: boolean;
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
  userId: string;
  amount: number;
  type: CreditType;
  originType: CreditOriginType;
  expiresAt?: string;
  note?: string;
}

export interface CancelCreditDto {
  creditId: string;
  reason?: string;
}

export interface ReconciliationResult {
  id: string;
  walletId: string;
  expectedBalance: number;
  actualBalance: number;
  difference: number;
  status: 'OK' | 'MISMATCH';
  checkedAt: string;
}

export interface WalletAnalytics {
  period: { from: string; to: string };
  totalCreditsIssued: number;
  totalCreditsSpent: number;
  totalRefunds: number;
  totalDisputes: number;
  disputeResolutionRate: number;
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

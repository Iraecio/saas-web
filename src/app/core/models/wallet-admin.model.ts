import { Credit, Dispute, RefundRequest, WalletAuditLogEntry } from './wallet.model';

export type AdminWalletRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'RESELLER'
  | 'RESELLER_MANAGER'
  | 'VOICE_ACTOR'
  | 'PRODUCER'
  | 'CLIENT';
export type AdminWalletStatus = 'ACTIVE' | 'BLOCKED' | 'ARCHIVED';
export type WalletSort =
  | 'owner'
  | 'balance'
  | 'reserved'
  | 'expiring'
  | 'createdAt'
  | 'lastMovementAt';

export interface AdminWalletSummary {
  id: string;
  walletId: string;
  userId: string;
  ownerName: string;
  ownerEmail: string;
  role: AdminWalletRole;
  accountStatus: AdminWalletStatus;
  resellerId?: string | null;
  resellerName?: string | null;
  currency: string;
  availableCredits: number;
  frozenCredits: number;
  expiredCredits: number;
  expiringCredits: number;
  totalReceived: number;
  totalSpent: number;
  totalRefunded: number;
  pendingCount: number;
  hasDiscrepancy: boolean;
  lastMovementAt?: string | null;
  createdAt: string;
  updatedAt: string;
  version: string;
}

export interface AdminWalletQuery {
  search: string;
  role: AdminWalletRole | '';
  status: AdminWalletStatus | '';
  resellerId: string;
  balanceMin: number | null;
  balanceMax: number | null;
  hasReservations: boolean | null;
  hasDiscrepancy: boolean | null;
  expiringWithinDays: number | null;
  sort: WalletSort;
  direction: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

export interface AdminWalletTotals {
  wallets: number;
  availableCredits: number;
  frozenCredits: number;
  expiredCredits: number;
  expiringCredits: number;
  discrepancies: number;
  pendingActions: number;
}

export interface AdminWalletPage {
  items: AdminWalletSummary[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  totals: AdminWalletTotals;
  queryFingerprint?: string;
}

export interface AdminWalletOverview extends AdminWalletTotals {
  totalIssued: number;
  totalSpent: number;
  totalRefunded: number;
  totalExpired: number;
  byRole: Array<{ role: AdminWalletRole; count: number; balance: number }>;
}

export interface AdminWalletDetail extends AdminWalletSummary {
  credits?: Credit[];
  disputes?: Dispute[];
  refunds?: RefundRequest[];
  audit?: WalletAuditLogEntry[];
}

export interface WalletBulkSelection {
  mode: 'EXPLICIT' | 'FILTER';
  walletIds: string[];
  excludedIds: string[];
  queryFingerprint?: string;
  count: number;
}

export interface WalletActionPreview {
  eligibleCount: number;
  ineligibleCount: number;
  beforeCredits: number;
  deltaCredits: number;
  afterCredits: number;
  warnings: string[];
  previewToken: string;
  expiresAt: string;
}

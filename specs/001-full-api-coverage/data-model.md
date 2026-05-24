# Data Model: Cobertura Completa da API no Frontend

**Branch**: `001-full-api-coverage` | **Date**: 2026-05-23

Todos os modelos de dados (interfaces TypeScript) que precisam ser criados ou estendidos no frontend para cobrir os endpoints da API.

---

## Modelos existentes (já em `src/app/core/models/`)

### `user.model.ts` — a estender

```typescript
// Adicionar ao User existente:
interface User {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  isActive?: boolean;
  resellerId?: string | null;
  permissions?: UserPermission[];  // era string[], expandir
  lastLoginAt?: string | null;
  avatarUrl?: string | null;       // adicionar
  department?: string | null;      // adicionar
  jobTitle?: string | null;        // adicionar
  createdAt?: string;
  updatedAt?: string;
}

interface UserPermission {
  id: string;
  userId: string;
  permissionName: string;
  grantedById: string;
  grantedAt: string;
  expiresAt?: string | null;
}

// Para o endpoint POST /users/:id/permissions
interface GrantPermissionDto {
  permissionName: string;
  expiresAt?: string;
}
```

---

## Novos modelos — criar em `src/app/core/models/`

### `profile.model.ts`

```typescript
interface VoiceProfile {
  id: string;
  userId: string;
  // campos retornados pela API (a confirmar na integração)
  bio?: string;
  languages?: string[];
  voiceStyles?: string[];
  audioSampleUrl?: string | null;
}

interface ProducerProfile {
  id: string;
  userId: string;
  bio?: string;
  specialty?: string;
  portfolioUrl?: string | null;
}

interface ClientProfile {
  id: string;
  userId: string;
  companyName?: string;
  phone?: string;
  address?: string;
}

interface StorageQuota {
  userId: string;
  usedBytes: number;
  totalBytes: number;
  usedFormatted: string;    // "12.4 MB" — calculado no frontend
  totalFormatted: string;   // "1 GB" — calculado no frontend
  usagePercent: number;     // 0-100
}
```

---

### `custom-domain.model.ts`

```typescript
interface CustomDomain {
  id: string;
  resellerId: string;
  domain: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RegisterCustomDomainDto {
  domain: string;
}

interface RegisterCustomDomainResponse {
  success: boolean;
  domain: string;
  message: string;  // instruções DNS
}
```

---

### `wallet.model.ts`

```typescript
// Enums (espelham o backend Prisma)
type CreditStatus = 'AVAILABLE' | 'FROZEN' | 'SPENT' | 'CANCELLED' | 'REFUNDED' | 'EXPIRED';
type CreditType = 'PAID' | 'PROMOTIONAL' | 'EARNED' | 'BONUS';
type CreditOriginType = 'PURCHASE' | 'SERVICE_PAYMENT' | 'ADJUSTMENT' | 'PROMOTION' | 'BONUS';
type CreditEventType = 'ISSUED' | 'TRANSFERRED' | 'FROZEN' | 'UNFROZEN' | 'SPENT' | 'REFUNDED' | 'CANCELLED' | 'EXPIRED' | 'DISPUTED';
type RefundStatus = 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';
type DisputeStatus = 'OPENED' | 'INVESTIGATING' | 'RESOLVED' | 'CHARGEBACK_FILED';

// Wallet
interface WalletBalance {
  balance: number;
  currency: string;  // ex: "BRL"
}

// Credit
interface Credit {
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

interface CreditWithContext extends Credit {
  events: CreditEvent[];
  disputes: Dispute[];
}

interface CreditEvent {
  id: string;
  creditId: string;
  eventType: CreditEventType;
  amount?: number;
  note?: string;
  triggeredById: string;
  createdAt: string;
}

// Credits list (cursor pagination)
interface CreditsListResponse {
  items: Credit[];
  nextCursor?: string | null;
  hasMore: boolean;
}

// Dispute
interface Dispute {
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

interface ReportDisputeDto {
  reason: string;
  metadata?: Record<string, unknown>;
}

interface UpdateDisputeDto {
  status?: DisputeStatus;
  investigationNotes?: string;
  resolution?: string;
}

// Refund
interface RefundRequest {
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

interface RequestRefundDto {
  reason: string;
  note?: string;
}

// Wallet Notification
interface WalletNotification {
  type: 'EXPIRING_SOON' | 'FROZEN' | 'DISPUTE_UPDATE' | 'REFUND_UPDATE';
  message: string;
  creditId?: string;
  createdAt: string;
}

// Admin — Issue Credits
interface IssueCreditDto {
  userId: string;
  amount: number;
  type: CreditType;
  originType: CreditOriginType;
  expiresAt?: string;
  note?: string;
}

// Admin — Cancel Credits
interface CancelCreditDto {
  creditId: string;
  reason?: string;
}

// Admin — Wallet (list)
interface WalletSummary {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  creditCount: number;
  createdAt: string;
}

// Admin — Reconciliation
interface ReconciliationResult {
  id: string;
  walletId: string;
  expectedBalance: number;
  actualBalance: number;
  difference: number;
  status: 'OK' | 'MISMATCH';
  checkedAt: string;
}

// Admin — Analytics
interface WalletAnalytics {
  period: { from: string; to: string };
  totalCreditsIssued: number;
  totalCreditsSpent: number;
  totalRefunds: number;
  totalDisputes: number;
  disputeResolutionRate: number;
}

// Admin — Audit Log
interface WalletAuditLogEntry {
  id: string;
  walletId?: string;
  creditId?: string;
  action: string;
  performedBy: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}
```

---

### `storage.model.ts`

```typescript
type StorageBucket = 'images' | 'audios' | 'documents';

interface UploadResponse {
  path: string;
  fullPath: string;
  bucket: StorageBucket;
  size: number;
  mimeType: string;
}

interface SignedUrlResponse {
  signedUrl: string;
  expiresAt: string;
}

interface DeleteFileDto {
  bucket: StorageBucket;
  path: string;
}
```

---

## Sumário de arquivos de modelo a criar/atualizar

| Arquivo | Ação |
|---------|------|
| `src/app/core/models/user.model.ts` | Estender `User`, adicionar `UserPermission`, `GrantPermissionDto` |
| `src/app/core/models/profile.model.ts` | Criar — VoiceProfile, ProducerProfile, ClientProfile, StorageQuota |
| `src/app/core/models/custom-domain.model.ts` | Criar — CustomDomain, DTOs |
| `src/app/core/models/wallet.model.ts` | Criar — Wallet, Credit, Dispute, Refund, Analytics, AuditLog |
| `src/app/core/models/storage.model.ts` | Criar — Upload, SignedUrl, Delete DTOs |

# Data Model: Marketplace de Pedidos, Catálogo e Escopo

**Branch**: `002-marketplace-orders-catalog` | **Date**: 2026-06-08

Interfaces TypeScript a criar em `src/app/core/models/`. Espelham os contratos de `saas-api` (specs 004/005/006). Campos opcionais (`?`) refletem variação por papel ou por escopo na resposta da API.

> Convenção: enums como union types de string literal (padrão já usado no projeto).

---

## service.model.ts

```typescript
export type ProfessionalRole = 'VOICE_ACTOR' | 'PRODUCER';
export type ServiceScope = 'GLOBAL' | 'PARTICULAR';
export type CreditType = 'PLATFORM' | 'RESELLER';
export type ServiceAction = 'CREATED' | 'UPDATED' | 'DEACTIVATED' | 'REACTIVATED';

export interface Service {
  id: string;
  name: string;
  description?: string;
  professionalRole: ProfessionalRole;
  scope: ServiceScope;
  ownerId: string | null;          // null = GLOBAL (plataforma)
  creditCost: number;              // inteiro >= 1
  creditType: CreditType;          // derivado do scope
  professionalPayout?: number;     // centavos; só visível p/ profissional/admin
  maxDurationSeconds?: number;     // opcional
  defaultDeliveryHours: number;
  maxRevisions: number;
  isActive: boolean;
  createdById?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateServiceDto {
  name: string;
  description?: string;
  professionalRole: ProfessionalRole;
  scope?: ServiceScope;            // ADMIN: GLOBAL; RESELLER: inferido PARTICULAR
  creditCost: number;
  professionalPayout?: number;     // obrigatório quando scope = GLOBAL
  maxDurationSeconds?: number;
  defaultDeliveryHours: number;
  maxRevisions: number;
}

// confirmImpact obrigatório ao alterar creditCost/defaultDeliveryHours/maxRevisions
export interface UpdateServiceDto extends Partial<CreateServiceDto> {
  confirmImpact?: boolean;
}

export interface ServiceAuditEntry {
  id: string;
  serviceId: string;
  actorId: string;
  actorRole: string;
  action: ServiceAction;
  // CREATED: snapshot { campo: valor }; UPDATED: { campo: { from, to } }
  changedFields: Record<string, unknown>;
  createdAt: string;
}

export interface ServiceListFilters {
  professionalRole?: ProfessionalRole;
  ownerId?: string;                // apenas ADMIN
  includeInactive?: boolean;       // ADMIN / RESELLER (próprios)
}
```

---

## order.model.ts

```typescript
import { ProfessionalRole, CreditType } from './service.model';

export type OrderType = 'VOICE' | 'PRODUCTION';
export type OrderStatus =
  | 'PENDING'
  | 'AWAITING_BRIEF'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';
export type DisputeDecision = 'FAVOR_CLIENT' | 'FAVOR_PROFESSIONAL';

export interface OrderBriefVersion {
  versionNumber: number;
  briefingText: string;
  briefingFileUrl?: string | null;
  revisionReason?: string | null;
  submittedAt: string;
}

export interface OrderDelivery {
  versionNumber: number;
  audioUrl: string;
  deliveryNotes?: string;
  redeliveryReason?: string | null;
  deliveredAt: string;
}

export interface Order {
  id: string;
  orderType: OrderType;
  status: OrderStatus;
  clientId: string;
  professionalId: string;
  serviceId: string;
  creditCost: number;
  creditType: CreditType;
  revisionCount: number;
  maxRevisions: number;
  deadlineAt?: string | null;
  currentBrief?: OrderBriefVersion;
  currentDelivery?: OrderDelivery;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStatusHistoryEntry {
  fromStatus: OrderStatus | null;
  toStatus: OrderStatus;
  actorId: string;
  actorRole: string;
  notes?: string | null;
  createdAt: string;
}

export interface OrderListFilters {
  status?: OrderStatus;
  orderType?: OrderType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

// Criação — VOICE (JSON) ou PRODUCTION (FormData com `file`)
export interface CreateOrderDto {
  professionalId: string;
  serviceId: string;
  orderType: OrderType;
  briefingText: string;
  file?: File;                     // obrigatório p/ PRODUCTION
}

// DTOs de ação
export interface ReasonDto { reason: string; }
export interface InstructionsDto { instructions: string; }
export interface JustificationDto { justification: string; }
export interface UpdateBriefDto { briefingText: string; file?: File; }
export interface DeliverDto { deliveryNotes?: string; redeliveryReason?: string; file: File; }
export interface ResolveDisputeDto { decision: DisputeDecision; notes: string; }
```

---

## professional.model.ts

```typescript
import { ProfessionalRole, ServiceScope } from './service.model';

export interface Professional {
  id: string;
  userId: string;
  scope: ServiceScope;             // GLOBAL | PARTICULAR
  resellerId: string | null;
  name: string;
  verificationStatus?: string;
  accent?: string;                 // específico de locutor; produtor: campos a refinar na integração
}

export interface ProfessionalListResponse {
  professionals: Professional[];
  pagination?: { page: number; limit: number; total: number };
}

export interface ProfessionalListFilters {
  scope?: ServiceScope;
  page?: number;
  limit?: number;
}

// resellerId obrigatório apenas quando scope = PARTICULAR
export interface SetScopeDto {
  scope: ServiceScope;
  resellerId?: string;
}
```

---

## withdrawal.model.ts

```typescript
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface WithdrawalRequest {
  id: string;
  status: WithdrawalStatus;
  creditAmount: number;            // 300 (mínimo)
  amountCents: number;             // 30000 = R$300,00
  requestedAt: string;
  paymentReference?: string;
  reason?: string;
}

export interface WithdrawalListFilters {
  status?: WithdrawalStatus;
  page?: number;
  limit?: number;
}

export interface CompleteWithdrawalDto { paymentReference: string; }
export interface RejectWithdrawalDto { reason: string; }
```

---

## reseller-credit.model.ts

```typescript
export interface EmitCreditDto {
  clientId: string;
  creditAmount: number;            // inteiro > 0
  unitValueCents: number;          // valor cobrado por crédito
}

export interface CreditEmission {
  emissionId: string;
  clientId: string;
  creditAmount: number;
  unitValueCents: number;
  totalValueCents: number;
  newWalletBalance?: number;       // presente na resposta da emissão
  emittedAt: string;
}

export interface EmissionsSummary {
  totalEmissions: number;
  totalCreditsEmitted: number;
  totalVolumeUsedCredits: number;
}

export interface EmissionsReport {
  emissions: CreditEmission[];
  summary: EmissionsSummary;
  pagination: { page: number; limit: number; total: number };
}

export interface EmissionsFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}
```

---

## wallet.model.ts (estender existente)

```typescript
// Adicionar ao arquivo existente — NÃO remover os tipos atuais (Credit, RefundRequest, etc.)
export type WalletType = 'PLATFORM' | 'RESELLER';

export interface Wallet {
  id: string;
  walletType: WalletType;
  availableCredits: number;
  frozenCredits: number;
  currency: string;                // 'BRL'
}
```

---

## Notas de mapeamento

- Todas as respostas chegam desembrulhadas de `{ success, data }` (interceptor existente) — os tipos acima descrevem o conteúdo de `data`.
- `professionalPayout` só vem preenchido para profissionais/admin; tratar como opcional na UI.
- `ownerId === null` ⇒ serviço GLOBAL; `creditType` é derivado e nunca enviado na criação.
- Datas são ISO 8601 string; formatar com `DatePipe` no template.

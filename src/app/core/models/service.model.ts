import { WalletType } from './wallet.model';

// ── Enums ────────────────────────────────────────────────────────────────────
export type ProfessionalRole = 'VOICE_ACTOR' | 'PRODUCER';
export type ServiceScope = 'GLOBAL' | 'PARTICULAR';
export type ServiceAction = 'CREATED' | 'UPDATED' | 'DEACTIVATED' | 'REACTIVATED';

// `creditType` é derivado do scope (GLOBAL→PLATFORM, PARTICULAR→RESELLER) e usa
// o mesmo union de `WalletType`.
export type CreditType = WalletType;

// ── Service ──────────────────────────────────────────────────────────────────
export interface Service {
  id: string;
  name: string;
  description?: string;
  professionalRole: ProfessionalRole;
  scope: ServiceScope;
  ownerId: string | null; // null = GLOBAL (plataforma)
  creditCost: number; // inteiro >= 1
  creditType: CreditType; // derivado do scope
  professionalPayout?: number; // centavos; só visível p/ profissional/admin
  maxDurationSeconds?: number; // opcional
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
  scope?: ServiceScope; // ADMIN: GLOBAL; RESELLER: inferido PARTICULAR
  creditCost: number;
  professionalPayout?: number; // obrigatório quando scope = GLOBAL
  maxDurationSeconds?: number;
  defaultDeliveryHours: number;
  maxRevisions: number;
}

// `confirmImpact` é obrigatório ao alterar creditCost/defaultDeliveryHours/maxRevisions.
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
  ownerId?: string; // apenas ADMIN
  includeInactive?: boolean; // ADMIN / RESELLER (próprios)
}

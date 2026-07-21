import { CreditType } from './service.model';

// ── Enums ────────────────────────────────────────────────────────────────────
export type OrderType = 'VOICE' | 'PRODUCTION';
export type OrderStatus =
  | 'BLOCKED'
  | 'AWAITING_ASSIGNMENT'
  | 'PENDING'
  | 'AWAITING_BRIEF'
  | 'IN_PROGRESS'
  | 'REVIEW'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';
export type DisputeDecision = 'FAVOR_CLIENT' | 'FAVOR_PROFESSIONAL';

// ── Versões de briefing e entrega ────────────────────────────────────────────
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

// ── Order ────────────────────────────────────────────────────────────────────
export interface Order {
  id: string;
  status: OrderStatus;
  clientId: string;
  resellerId?: string | null;
  briefing?: string | null;
  lineItems: OrderLineItem[];
  createdAt: string;
  updatedAt?: string;
}

export interface OrderLineItem {
  id: string; orderId: string; position: number; parentLineItemId?: string | null;
  serviceId?: string | null; professionalId?: string | null; itemType: OrderType;
  status: OrderStatus; creditCost: number; professionalPayoutCents?: number | null;
  revisionCount: number; maxRevisions: number; deadlineAt?: string | null;
  briefing?: string | null; deliveryUrl?: string | null; createdAt: string; updatedAt?: string;
  currentBrief?: OrderBriefVersion; currentDelivery?: OrderDelivery;
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

// ── DTOs ─────────────────────────────────────────────────────────────────────
// Criação — VOICE (JSON) ou PRODUCTION (FormData com `file`)
export interface CreateOrderDto {
  briefing?: string;
  items: Array<{ ref?: string; serviceId?: string; professionalId?: string; parentRef?: string; briefingText?: string }>;
}

export interface ReasonDto {
  reason: string;
}
export interface InstructionsDto {
  instructions: string;
}
export interface JustificationDto {
  justification: string;
}
export interface UpdateBriefDto {
  briefingText: string;
  file?: File;
}
export interface DeliverDto {
  deliveryNotes?: string;
  redeliveryReason?: string; // obrigatório em re-entrega (status REVIEW)
  file: File;
}
export interface ResolveDisputeDto {
  decision: DisputeDecision;
  notes: string;
}

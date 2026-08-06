import { ProfessionalRole, ServiceScope } from './service.model';

export type NegotiationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'APPLIED';
export type NegotiationInitiator = 'PROFESSIONAL' | 'MANAGER';
export type NegotiationNextActor = 'MANAGER' | 'PROFESSIONAL' | 'NONE';

export interface NegotiationProfessional {
  id: string;
  name: string;
  role: ProfessionalRole;
  avatarUrl: string | null;
  scope: ServiceScope;
  resellerName: string | null;
}

export interface NegotiationServiceSummary {
  id: string;
  name: string;
  scope: ServiceScope;
  active: boolean;
}

export interface ServiceNegotiationSummary {
  id: string;
  pricingId: string;
  professional: NegotiationProfessional;
  service: NegotiationServiceSummary;
  currentPriceCents: number;
  previousPriceCents: number;
  proposedPriceCents: number;
  variationPercent: number;
  initiator: NegotiationInitiator;
  status: NegotiationStatus;
  nextActor: NegotiationNextActor;
  notes: string | null;
  createdAt: string;
  decidedAt: string | null;
}

export interface ServiceNegotiationStep {
  id: string;
  initiator: NegotiationInitiator;
  initiatedById: string;
  initiatedBy?: { id: string; name: string | null };
  previousPriceCents: number;
  proposedPriceCents: number;
  status: NegotiationStatus;
  counteredFromId: string | null;
  decidedById: string | null;
  decidedBy?: { id: string; name: string | null } | null;
  decidedAt: string | null;
  notes: string | null;
  createdAt: string;
}

export interface ServiceNegotiationDetail extends ServiceNegotiationSummary {
  timeline: ServiceNegotiationStep[];
}

export interface NegotiationCounters {
  pendingManager: number;
  pendingProfessional: number;
  finished: number;
}

export interface NegotiationPage {
  items: ServiceNegotiationSummary[];
  page: number;
  pageSize: number;
  total: number;
  counters: NegotiationCounters;
}

export interface NegotiationFilters {
  page?: number;
  pageSize?: number;
  status?: NegotiationStatus | '';
  nextActor?: NegotiationNextActor | '';
  professionalRole?: ProfessionalRole | '';
  serviceId?: string;
  search?: string;
}

export const DEFAULT_NEGOTIATION_FILTERS: NegotiationFilters = { page: 1, pageSize: 20 };

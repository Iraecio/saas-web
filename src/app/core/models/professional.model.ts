import { ServiceScope } from './service.model';

// Profissional (locutor ou produtor) com classificação de escopo (spec 002 / saas-api 004).
export interface Professional {
  id: string;
  userId: string;
  scope: ServiceScope; // GLOBAL | PARTICULAR
  resellerId: string | null;
  name: string;
  avatarUrl?: string | null;
  demoUrl?: string | null;
  voiceSamplesUrls?: string[];
  portfolioUrls?: string[];
  verificationStatus?: string;
  accent?: string; // específico de locutor; campos de produtor a refinar na integração
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

// resellerId obrigatório apenas quando scope = PARTICULAR.
export interface SetScopeDto {
  scope: ServiceScope;
  resellerId?: string;
}

export type ProfessionalRole = 'VOICE_ACTOR' | 'PRODUCER';
export type NegotiationInitiator = 'PROFESSIONAL' | 'MANAGER';
export type NegotiationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'APPLIED';

export interface ProfessionalOffering {
  serviceId: string;
  serviceName: string;
  professionalRole: ProfessionalRole;
  scope: ServiceScope;
  priceCents: number;
  active: boolean;
  pendingNegotiationId?: string | null;
  updatedAt: string;
}

export interface ServicePriceNegotiation {
  id: string;
  pricingId: string;
  initiator: NegotiationInitiator;
  initiatedById: string;
  previousPriceCents: number;
  proposedPriceCents: number;
  status: NegotiationStatus;
  counteredFromId?: string | null;
  decidedById?: string | null;
  decidedAt?: string | null;
  notes?: string | null;
  createdAt: string;
}

export interface ProposeServicePriceDto {
  proposedPriceCents: number;
  notes?: string;
}

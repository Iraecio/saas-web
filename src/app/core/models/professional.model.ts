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

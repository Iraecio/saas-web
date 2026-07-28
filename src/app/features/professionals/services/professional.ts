import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  Professional,
  ProfessionalListFilters,
  ProfessionalListResponse,
  SetScopeDto,
} from '../../../core/models/professional.model';

type ProfessionalType = 'voice-actors' | 'producers';

interface ProfessionalApiItem extends Omit<Professional, 'name'> {
  name?: string;
  user?: {
    name?: string | null;
    email?: string | null;
    avatarUrl?: string | null;
    resellerId?: string | null;
  };
}

interface ProfessionalApiResponse {
  items?: ProfessionalApiItem[];
  professionals?: ProfessionalApiItem[];
  total?: number;
  pagination?: ProfessionalListResponse['pagination'];
}

@Injectable({ providedIn: 'root' })
export class ProfessionalService {
  private readonly api = inject(ApiService);

  listVoiceActors(filters?: ProfessionalListFilters): Observable<ProfessionalListResponse> {
    return this.api.get<ProfessionalApiResponse>(
      '/professionals/voice-actors',
      this.toParams(filters),
    ).pipe(map((response) => this.normalizeResponse(response, filters)));
  }

  listProducers(filters?: ProfessionalListFilters): Observable<ProfessionalListResponse> {
    return this.api.get<ProfessionalApiResponse>(
      '/professionals/producers',
      this.toParams(filters),
    ).pipe(map((response) => this.normalizeResponse(response, filters)));
  }

  setScope(type: ProfessionalType, id: string, dto: SetScopeDto): Observable<Professional> {
    return this.api.put<Professional>(`/professionals/${type}/${id}/scope`, dto);
  }

  private toParams(filters?: ProfessionalListFilters): Record<string, string | number> {
    const params: Record<string, string | number> = {};
    if (filters?.scope) params['scope'] = filters.scope;
    if (filters?.page) params['page'] = filters.page;
    if (filters?.limit) params['limit'] = filters.limit;
    return params;
  }

  private normalizeResponse(
    response: ProfessionalApiResponse,
    filters?: ProfessionalListFilters,
  ): ProfessionalListResponse {
    const items = response.items ?? response.professionals ?? [];
    return {
      professionals: items.map(({ user, ...profile }) => ({
        ...profile,
        name: profile.name ?? user?.name ?? user?.email ?? 'Profissional',
        avatarUrl: profile.avatarUrl ?? user?.avatarUrl ?? null,
        demoUrl: profile.demoUrl ?? profile.voiceSamplesUrls?.[0] ?? profile.portfolioUrls?.[0] ?? null,
        resellerId: profile.resellerId ?? user?.resellerId ?? null,
      })),
      pagination: response.pagination ?? {
        page: filters?.page ?? 1,
        limit: filters?.limit ?? 20,
        total: response.total ?? items.length,
      },
    };
  }
}

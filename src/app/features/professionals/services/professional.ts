import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  Professional,
  ProfessionalListFilters,
  ProfessionalListResponse,
  SetScopeDto,
} from '../../../core/models/professional.model';

type ProfessionalType = 'voice-actors' | 'producers';

@Injectable({ providedIn: 'root' })
export class ProfessionalService {
  private readonly api = inject(ApiService);

  listVoiceActors(filters?: ProfessionalListFilters): Observable<ProfessionalListResponse> {
    return this.api.get<ProfessionalListResponse>(
      '/professionals/voice-actors',
      this.toParams(filters),
    );
  }

  listProducers(filters?: ProfessionalListFilters): Observable<ProfessionalListResponse> {
    return this.api.get<ProfessionalListResponse>(
      '/professionals/producers',
      this.toParams(filters),
    );
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
}

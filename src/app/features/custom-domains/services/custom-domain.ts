import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api';
import {
  CustomDomain,
  RegisterCustomDomainDto,
  RegisterCustomDomainResponse,
} from '../../../core/models/custom-domain.model';

@Injectable({ providedIn: 'root' })
export class CustomDomainService {
  private readonly api = inject(ApiService);

  registerDomain(
    resellerId: string,
    dto: RegisterCustomDomainDto,
  ): Observable<RegisterCustomDomainResponse> {
    return this.api.post<RegisterCustomDomainResponse>(
      `/resellers/${resellerId}/custom-domains`,
      dto,
    );
  }

  listDomains(resellerId: string): Observable<CustomDomain[]> {
    return this.api.get<CustomDomain[]>(`/resellers/${resellerId}/custom-domains`);
  }

  deactivateDomain(resellerId: string, domainId: string): Observable<void> {
    return this.api.delete<void>(`/resellers/${resellerId}/custom-domains/${domainId}`);
  }
}

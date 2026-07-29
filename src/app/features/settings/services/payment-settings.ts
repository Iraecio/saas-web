import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreatePaymentConfigurationDto,
  PaymentConfiguration,
  PaymentMethodPolicy,
  UpdatePaymentConfigurationDto,
  UpsertPaymentPolicyDto,
} from '../../../core/models/payment-settings.model';
import { UserRole } from '../../../core/models/user.model';
import { ApiService } from '../../../core/services/api';

type PaymentSettingsRole = Extract<UserRole, 'SUPER_ADMIN' | 'RESELLER' | 'RESELLER_MANAGER'>;

@Injectable({ providedIn: 'root' })
export class PaymentSettingsService {
  private readonly api = inject(ApiService);

  listPolicies(role: PaymentSettingsRole): Observable<PaymentMethodPolicy[]> {
    return this.api.get<PaymentMethodPolicy[]>(
      role === 'SUPER_ADMIN'
        ? '/admin/payment-method-policies'
        : '/reseller/payment-method-policies',
    );
  }

  savePolicy(dto: UpsertPaymentPolicyDto): Observable<PaymentMethodPolicy> {
    return this.api.post<PaymentMethodPolicy>('/admin/payment-method-policies', dto);
  }

  listConfigurations(role: PaymentSettingsRole): Observable<PaymentConfiguration[]> {
    return this.api.get<PaymentConfiguration[]>(`${this.scope(role)}/payment-configurations`);
  }

  createConfiguration(
    role: PaymentSettingsRole,
    dto: CreatePaymentConfigurationDto,
  ): Observable<PaymentConfiguration> {
    return this.api.post<PaymentConfiguration>(`${this.scope(role)}/payment-configurations`, dto);
  }

  updateConfiguration(
    role: PaymentSettingsRole,
    id: string,
    dto: UpdatePaymentConfigurationDto,
  ): Observable<PaymentConfiguration> {
    return this.api.patch<PaymentConfiguration>(
      `${this.scope(role)}/payment-configurations/${id}`,
      dto,
    );
  }

  validateConfiguration(role: PaymentSettingsRole, id: string): Observable<PaymentConfiguration> {
    return this.action(role, id, 'validate');
  }

  activateConfiguration(role: PaymentSettingsRole, id: string): Observable<PaymentConfiguration> {
    return this.action(role, id, 'activate');
  }

  suspendConfiguration(id: string, reason: string): Observable<PaymentConfiguration> {
    return this.api.post<PaymentConfiguration>(`/admin/payment-configurations/${id}/suspend`, {
      reason,
    });
  }

  private action(
    role: PaymentSettingsRole,
    id: string,
    action: 'validate' | 'activate',
  ): Observable<PaymentConfiguration> {
    return this.api.post<PaymentConfiguration>(
      `${this.scope(role)}/payment-configurations/${id}/${action}`,
      {},
    );
  }

  private scope(role: PaymentSettingsRole): '/admin' | '/reseller' {
    return role === 'SUPER_ADMIN' ? '/admin' : '/reseller';
  }
}

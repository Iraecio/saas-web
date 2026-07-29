export type PaymentMethodType = 'MANUAL' | 'PIX' | 'PROVIDER';
export type PaymentOwnerType = 'PLATFORM' | 'RESELLER';
export type PaymentConfigStatus = 'DRAFT' | 'ACTIVE' | 'SUSPENDED' | 'INACTIVE' | 'INVALID';

export interface PaymentMethodPolicy {
  id: string;
  providerCode: string;
  methodType: PaymentMethodType;
  displayName: string;
  platformEnabled: boolean;
  resellerEnabled: boolean;
  capabilities: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentConfiguration {
  id: string;
  ownerType: PaymentOwnerType;
  resellerId?: string | null;
  policyId: string;
  policy: PaymentMethodPolicy;
  name: string;
  status: PaymentConfigStatus;
  priority: number;
  currency: string;
  publicConfig: Record<string, unknown>;
  credentialsVersion: number;
  hasCredentials: boolean;
  validatedAt?: string | null;
  validatedById?: string | null;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpsertPaymentPolicyDto {
  providerCode: string;
  methodType: PaymentMethodType;
  displayName: string;
  platformEnabled: boolean;
  resellerEnabled: boolean;
}

export interface CreatePaymentConfigurationDto {
  policyId: string;
  name: string;
  priority?: number;
  currency?: string;
  publicConfig: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

export interface UpdatePaymentConfigurationDto {
  name?: string;
  priority?: number;
  publicConfig?: Record<string, unknown>;
  credentials?: Record<string, unknown>;
}

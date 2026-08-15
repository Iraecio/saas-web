import { Professional, ProfessionalOffering, ProfessionalRole } from './professional.model';
import { ServiceScope } from './service.model';
import { User } from './user.model';

export type ProfessionalAccountStatus = 'ACTIVE' | 'BLOCKED';
export type ProfessionalSort = 'name' | 'lastLoginAt' | 'orders' | 'wallet';

export interface ProfessionalAdminItem extends Professional {
  role: ProfessionalRole;
  email?: string | null;
  accountStatus: ProfessionalAccountStatus;
  lastLoginAt?: string | null;
  activeOrders?: number;
  walletBalanceCents?: number;
  resellerName?: string | null;
}

export interface ProfessionalAdminFilters {
  query: string;
  role: ProfessionalRole | '';
  scope: ServiceScope | '';
  accountStatus: ProfessionalAccountStatus | '';
  verificationStatus: string;
  sort: ProfessionalSort;
  page: number;
  pageSize: number;
}

export interface ProfessionalAdminPage {
  items: ProfessionalAdminItem[];
  total: number;
  totalPages: number;
  counters: {
    total: number;
    voiceActors: number;
    producers: number;
    global: number;
    blocked: number;
  };
}

export interface ProfessionalAdminDetail {
  professional: ProfessionalAdminItem;
  user: User;
  offerings: ProfessionalOffering[];
}

export interface InspectionSession {
  id: string;
  inspectionToken: string;
  mode: 'READ_ONLY';
  target: { id: string; name: string; role: ProfessionalRole };
  startedAt: string;
  expiresAt: string;
}

import { UserRole } from './user.model';

export type RoleRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type RequestableRole = 'RESELLER' | 'VOICE_ACTOR' | 'PRODUCER';

export interface RoleRequestUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  resellerId?: string | null;
}

export interface RoleRequest {
  id: string;
  userId: string;
  requestedRole: UserRole;
  status: RoleRequestStatus;
  justification?: string | null;
  portfolioNotes?: string | null;
  audioUrls?: string[];
  voiceStyles?: string[];
  photoUrl?: string | null;
  companyName?: string | null;
  specialty?: string | null;
  rejectionReason?: string | null;
  reviewedById?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: RoleRequestUser;
}

export interface CreateRoleRequestDto {
  requestedRole: RequestableRole;
  justification: string;
  portfolioNotes?: string;
  audioUrls?: string[];
  voiceStyles?: string[];
  photoUrl?: string;
  companyName?: string;
  specialty?: string;
}

export interface RoleRequestsListResponse {
  items: RoleRequest[];
  total: number;
  page: number;
  pageSize: number;
}

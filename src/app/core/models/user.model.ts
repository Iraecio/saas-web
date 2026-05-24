export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'RESELLER'
  | 'RESELLER_MANAGER'
  | 'VOICE_ACTOR'
  | 'PRODUCER'
  | 'CLIENT';

export interface UserPermission {
  id: string;
  userId: string;
  permissionName: string;
  grantedById: string;
  grantedAt: string;
  expiresAt?: string | null;
}

export interface GrantPermissionDto {
  permissionName: string;
  expiresAt?: string;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  avatarUrl?: string | null;
  department?: string | null;
  jobTitle?: string | null;
  role: UserRole;
  isActive?: boolean;
  resellerId?: string | null;
  permissions?: UserPermission[];
  lastLoginAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface ApiError {
  success: false;
  statusCode: number;
  message: string;
  errors?: string[];
}

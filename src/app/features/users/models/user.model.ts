import { UserRole } from '../../../core/models/user.model';

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt?: string | null;
  resellerId?: string | null;
  status: 'active' | 'disabled';
}

export interface UsersPage {
  users: UserListItem[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

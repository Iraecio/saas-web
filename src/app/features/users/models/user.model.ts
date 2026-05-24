import { UserRole } from '../../../core/models/user.model';

export interface UserListItem {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  status: 'active' | 'invited' | 'disabled';
}

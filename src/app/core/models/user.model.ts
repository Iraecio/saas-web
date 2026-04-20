export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

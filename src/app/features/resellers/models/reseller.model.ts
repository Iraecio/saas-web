export interface Reseller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  ownerId?: string;
  timezone?: string;
  maxUsers?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ResellerListItem extends Reseller {}

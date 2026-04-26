export interface Reseller {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  commissionRate: number;
  totalSales: number;
  totalCommission: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResellerListItem extends Reseller {}

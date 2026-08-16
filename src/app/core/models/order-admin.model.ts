import { Order, OrderStatus, OrderType } from './order.model';

export type OrderOrigin = 'PLATFORM' | 'RESELLER';
export type OrderAdminSort = 'createdAt' | 'updatedAt' | 'deadlineAt' | 'totalCredits';

export interface OrderAdminQuery {
  q: string;
  status: OrderStatus | '';
  orderType: OrderType | '';
  origin: OrderOrigin | '';
  overdue: boolean;
  startDate: string;
  endDate: string;
  sort: OrderAdminSort;
  direction: 'asc' | 'desc';
  page: number;
  limit: number;
}

export interface OrderAdminParticipant {
  id: string;
  name: string;
  email?: string | null;
}

export interface OrderAdminOrder extends Order {
  client: OrderAdminParticipant;
  reseller?: { id: string; companyName?: string | null } | null;
  lineItems: Array<
    Order['lineItems'][number] & {
      professional?: OrderAdminParticipant | null;
      service?: { id: string; name: string } | null;
    }
  >;
}

export interface OrderAdminPage {
  items: OrderAdminOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const DEFAULT_ORDER_ADMIN_QUERY: OrderAdminQuery = {
  q: '',
  status: '',
  orderType: '',
  origin: '',
  overdue: false,
  startDate: '',
  endDate: '',
  sort: 'createdAt',
  direction: 'desc',
  page: 1,
  limit: 25,
};

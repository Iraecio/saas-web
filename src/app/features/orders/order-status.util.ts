import { OrderStatus } from '../../core/models/order.model';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendente',
  AWAITING_BRIEF: 'Aguardando briefing',
  IN_PROGRESS: 'Em andamento',
  REVIEW: 'Em revisão',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  DISPUTED: 'Em disputa',
};

import { OrderStatus } from '../../core/models/order.model';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  BLOCKED: 'Bloqueado',
  AWAITING_ASSIGNMENT: 'Aguardando atribuição',
  PENDING: 'Pendente',
  AWAITING_BRIEF: 'Aguardando briefing',
  IN_PROGRESS: 'Em andamento',
  REVIEW: 'Em revisão',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado',
  DISPUTED: 'Em disputa',
};

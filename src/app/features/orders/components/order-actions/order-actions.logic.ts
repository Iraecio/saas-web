import { Order, OrderStatus } from '../../../../core/models/order.model';
import { UserRole } from '../../../../core/models/user.model';

// Ações possíveis sobre um pedido (espelham os endpoints de order-flow).
export type OrderAction =
  | 'cancel'
  | 'request-brief-revision'
  | 'accept'
  | 'refuse'
  | 'update-brief'
  | 'deliver'
  | 'approve'
  | 'request-revision'
  | 'dispute'
  | 'resolve';

export interface ActionContext {
  status: OrderStatus;
  role: UserRole;
  isOwnerClient: boolean; // usuário é o cliente dono do pedido
  isAssignedProfessional: boolean; // usuário é o profissional atribuído
  canResolveDispute: boolean; // ADMIN sempre; RESELLER se pedido PARTICULAR da sua rede
  revisionCount: number;
  maxRevisions: number;
  deadlinePassed: boolean; // now > deadlineAt
}

/**
 * Fonte ÚNICA de verdade para quais ações aparecem na UI.
 * Garante FR-020/SC-003: nenhuma ação inválida para o status×papel é oferecida.
 */
export function availableOrderActions(ctx: ActionContext): OrderAction[] {
  const actions: OrderAction[] = [];
  const { status, isOwnerClient, isAssignedProfessional, canResolveDispute } = ctx;

  switch (status) {
    case 'PENDING':
      if (isOwnerClient) actions.push('cancel');
      if (isAssignedProfessional) {
        actions.push('request-brief-revision', 'accept', 'refuse');
      }
      break;

    case 'AWAITING_BRIEF':
      if (isOwnerClient) actions.push('update-brief', 'cancel');
      break;

    case 'IN_PROGRESS':
      if (isAssignedProfessional) actions.push('deliver');
      if (isOwnerClient && ctx.deadlinePassed) actions.push('cancel');
      break;

    case 'REVIEW':
      if (isAssignedProfessional) actions.push('deliver'); // re-entrega
      if (isOwnerClient) {
        actions.push('approve');
        if (ctx.revisionCount < ctx.maxRevisions) actions.push('request-revision');
        actions.push('dispute');
      }
      break;

    case 'DISPUTED':
      if (canResolveDispute) actions.push('resolve');
      break;

    // COMPLETED, CANCELLED → sem ações
    default:
      break;
  }

  return actions;
}

// Helper para montar o contexto a partir do Order + dados do usuário.
export function buildActionContext(
  order: Order,
  userId: string,
  role: UserRole,
  canResolveDispute: boolean,
): ActionContext {
  return {
    status: order.status,
    role,
    isOwnerClient: order.clientId === userId,
    isAssignedProfessional: order.professionalId === userId,
    canResolveDispute,
    revisionCount: order.revisionCount,
    maxRevisions: order.maxRevisions,
    deadlinePassed: order.deadlineAt ? new Date(order.deadlineAt).getTime() < Date.now() : false,
  };
}

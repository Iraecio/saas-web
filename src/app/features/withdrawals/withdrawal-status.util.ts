import { WithdrawalStatus } from '../../core/models/withdrawal.model';

export const WITHDRAWAL_STATUS_LABELS: Record<WithdrawalStatus, string> = {
  PENDING: 'Pendente',
  PROCESSING: 'Processando',
  COMPLETED: 'Concluído',
  REJECTED: 'Rejeitado',
};

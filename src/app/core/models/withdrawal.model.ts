// Saque de profissional GLOBAL (spec 002 / saas-api 004).
export type WithdrawalStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';

export interface WithdrawalRequest {
  id: string;
  status: WithdrawalStatus;
  creditAmount: number; // 300 (mínimo)
  amountCents: number; // 30000 = R$300,00
  requestedAt: string;
  paymentReference?: string;
  reason?: string;
}

export interface WithdrawalListFilters {
  status?: WithdrawalStatus;
  page?: number;
  limit?: number;
}

export interface CompleteWithdrawalDto {
  paymentReference: string;
}

export interface RejectWithdrawalDto {
  reason: string;
}

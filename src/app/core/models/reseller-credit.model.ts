// Emissão de créditos RESELLER (spec 002 / saas-api 004).
export interface EmitCreditDto {
  clientId: string;
  creditAmount: number; // inteiro > 0
  unitValueCents: number; // valor cobrado por crédito
}

export interface CreditEmission {
  emissionId: string;
  clientId: string;
  creditAmount: number;
  unitValueCents: number;
  totalValueCents: number;
  newWalletBalance?: number; // presente na resposta da emissão
  emittedAt: string;
}

export interface EmissionsSummary {
  totalEmissions: number;
  totalCreditsEmitted: number;
  totalVolumeUsedCredits: number;
}

export interface EmissionsReport {
  emissions: CreditEmission[];
  summary: EmissionsSummary;
  pagination: { page: number; limit: number; total: number };
}

export interface EmissionsFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  page?: number;
  limit?: number;
}

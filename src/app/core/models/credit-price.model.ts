export interface PlatformCreditPrice {
  id: string;
  unitPriceCents: number;
  effectiveFrom: string;
  note?: string | null;
  createdAt: string;
}

export interface PlatformCreditPriceHistory {
  items: PlatformCreditPrice[];
  total: number;
}

export interface PlatformCreditPriceOverview {
  current?: PlatformCreditPrice | null;
  history: PlatformCreditPriceHistory;
}

export interface SetPlatformCreditPriceDto {
  unitPriceCents: number;
  effectiveFrom?: string;
  note?: string;
}

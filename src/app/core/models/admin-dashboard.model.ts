export interface DashboardMetric {
  current: number;
  previous: number;
  variationPercent: number | null;
  comparisonLabel: 'NORMAL' | 'NO_BASELINE';
  unit: 'COUNT' | 'CREDITS' | 'CENTS';
}

export interface AdminDashboardSummary {
  period: { from: string; to: string; previousFrom: string; previousTo: string; timezone: string };
  metrics: {
    activeUsers: DashboardMetric;
    ordersCreated: DashboardMetric;
    creditsIssued: DashboardMetric;
    creditsSpent: DashboardMetric;
    creditsRefunded: DashboardMetric;
    availableProfessionals: DashboardMetric;
    pendingDisputes: number;
    pendingRefunds: number;
    pendingWithdrawals: number;
    pendingCreditPurchases: number;
  };
  recentOrders: Array<{ id: string; status: string; createdAt: string; client: { name?: string | null; email: string }; lineItems: Array<{ id: string; itemType: string; status: string; creditCost: number }> }>;
  pendingActions: Array<{ id: string; type: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; title: string; createdAt: string; targetPath: string }>;
  generatedAt: string;
}

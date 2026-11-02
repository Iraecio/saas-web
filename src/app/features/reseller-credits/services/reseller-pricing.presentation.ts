export function parseMoneyToCents(value: string | number): number {
  const normalized = String(value).trim().replace(/\s/g, '').replace(/\./g, '').replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : 0;
}
export function formatMoneyInput(cents: number): string {
  return (cents / 100).toFixed(2).replace('.', ',');
}
export function marginFor(priceCents: number, costCents: number) {
  const cents = priceCents - costCents;
  return {
    cents,
    percent: costCents > 0 ? Math.round((cents / costCents) * 10_000) / 100 : null,
    status: cents < 0 ? 'negative' : cents === 0 ? 'neutral' : 'positive',
  } as const;
}

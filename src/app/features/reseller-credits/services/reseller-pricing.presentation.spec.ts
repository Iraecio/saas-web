import { describe, expect, it } from 'vitest';
import { formatMoneyInput, marginFor, parseMoneyToCents } from './reseller-pricing.presentation';

describe('reseller pricing presentation', () => {
  it('converte moeda localizada para centavos inteiros', () => {
    expect(parseMoneyToCents('1.234,56')).toBe(123456);
    expect(formatMoneyInput(123456)).toBe('1234,56');
  });
  it('calcula margens positiva, neutra e negativa', () => {
    expect(marginFor(1200, 1000)).toMatchObject({ cents: 200, percent: 20, status: 'positive' });
    expect(marginFor(1000, 1000).status).toBe('neutral');
    expect(marginFor(900, 1000).status).toBe('negative');
  });
});

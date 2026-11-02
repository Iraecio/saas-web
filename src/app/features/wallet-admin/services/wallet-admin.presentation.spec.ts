import { describe, expect, it } from 'vitest';
import {
  formatCredits,
  walletRoleLabel,
  walletStatusDescription,
} from './wallet-admin.presentation';

describe('wallet admin presentation', () => {
  it('uses human labels instead of raw roles', () => {
    expect(walletRoleLabel('RESELLER_MANAGER')).toBe('Gestor de revenda');
    expect(walletRoleLabel('VOICE_ACTOR')).toBe('Locutor');
  });

  it('describes blocked state without relying on color', () => {
    expect(walletStatusDescription('BLOCKED')).toContain('bloqueada');
  });

  it('formats integral credits without rounding to decimals', () => {
    expect(formatCredits(12873)).toBe('12.873');
  });
});

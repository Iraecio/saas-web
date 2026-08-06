import { describe, expect, it } from 'vitest';
import { ServiceNegotiationSummary } from '../../../core/models/service-negotiation.model';
import { canManagerDecide, formatMoney, roleLabel } from './service-negotiation.presentation';

const pending: ServiceNegotiationSummary = {
  id: 'neg-1',
  pricingId: 'pricing-1',
  professional: {
    id: 'pro-1',
    name: 'Marina Costa',
    role: 'VOICE_ACTOR',
    avatarUrl: null,
    scope: 'GLOBAL',
    resellerName: null,
  },
  service: { id: 'svc-1', name: 'Locução', scope: 'GLOBAL', active: true },
  currentPriceCents: 25000,
  previousPriceCents: 25000,
  proposedPriceCents: 30000,
  variationPercent: 20,
  initiator: 'PROFESSIONAL',
  status: 'PENDING',
  nextActor: 'MANAGER',
  notes: null,
  createdAt: '2026-08-06T12:00:00Z',
  decidedAt: null,
};

describe('service negotiation presentation', () => {
  it('allows a manager to decide only an active pending professional proposal', () => {
    expect(canManagerDecide(pending)).toBe(true);
    expect(canManagerDecide({ ...pending, nextActor: 'PROFESSIONAL' })).toBe(false);
    expect(canManagerDecide({ ...pending, status: 'ACCEPTED', nextActor: 'NONE' })).toBe(false);
    expect(canManagerDecide({ ...pending, service: { ...pending.service, active: false } })).toBe(
      false,
    );
  });

  it('formats financial and role labels for the administrative UI', () => {
    expect(formatMoney(27500)).toContain('275');
    expect(roleLabel('VOICE_ACTOR')).toBe('Locutor');
    expect(roleLabel('PRODUCER')).toBe('Produtor');
  });
});

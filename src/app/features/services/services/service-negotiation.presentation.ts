import {
  NegotiationStatus,
  ServiceNegotiationSummary,
} from '../../../core/models/service-negotiation.model';

export const NEGOTIATION_STATUS_LABEL: Record<NegotiationStatus, string> = {
  PENDING: 'Pendente',
  ACCEPTED: 'Aceita',
  REJECTED: 'Negada',
  COUNTERED: 'Contraposta',
  APPLIED: 'Aplicada',
};

export function canManagerDecide(item: ServiceNegotiationSummary): boolean {
  return item.status === 'PENDING' && item.nextActor === 'MANAGER' && item.service.active;
}

export function formatMoney(cents: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);
}

export function roleLabel(role: string): string {
  return role === 'VOICE_ACTOR' ? 'Locutor' : 'Produtor';
}

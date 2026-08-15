import { AdminWalletRole, AdminWalletStatus } from '../../../core/models/wallet-admin.model';

export const WALLET_ROLE_LABELS: Record<AdminWalletRole, string> = {
  SUPER_ADMIN: 'Superadmin',
  ADMIN: 'Administrador',
  RESELLER: 'Revendedor',
  RESELLER_MANAGER: 'Gestor de revenda',
  VOICE_ACTOR: 'Locutor',
  PRODUCER: 'Produtor',
  CLIENT: 'Cliente',
};

export function walletRoleLabel(role: AdminWalletRole): string {
  return WALLET_ROLE_LABELS[role] ?? role;
}

export function walletStatusLabel(status: AdminWalletStatus): string {
  return { ACTIVE: 'Ativa', BLOCKED: 'Bloqueada', ARCHIVED: 'Arquivada' }[status];
}

export function walletStatusDescription(status: AdminWalletStatus): string {
  return status === 'ACTIVE'
    ? 'Carteira ativa'
    : status === 'BLOCKED'
      ? 'Conta bloqueada; ações financeiras indisponíveis'
      : 'Carteira arquivada; disponível somente para consulta';
}

export function formatCredits(value: number): string {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value || 0);
}

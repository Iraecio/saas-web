import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { WalletService } from '../../services/wallet';
import { Wallet, WalletNotification } from '../../../../core/models/wallet.model';

@Component({
  selector: 'app-wallet-balance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe],
  template: `
    <div class="p-6 max-w-3xl mx-auto space-y-6">
      <header>
        <h1 class="text-3xl font-bold text-neutral-900 dark:text-white">Minha Carteira</h1>
        <p class="mt-1 text-sm text-neutral-500">Saldo e notificações da sua conta</p>
      </header>

      <!-- Carteiras (dupla carteira: PLATFORM + RESELLER) -->
      @if (loadingWallets()) {
        <div class="flex justify-center py-8">
          <div class="w-6 h-6 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
        </div>
      } @else {
        <div class="grid gap-3" [class.sm:grid-cols-2]="resellerWallet() !== null">
          @if (platformWallet(); as w) {
            <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
              <p class="text-sm text-neutral-500 mb-1">Carteira PLATFORM</p>
              <p class="text-4xl font-bold text-neutral-900 dark:text-white">
                {{ w.availableCredits | number }}
                <span class="text-xl font-normal text-neutral-500">créditos</span>
              </p>
              <p class="mt-1 text-xs text-neutral-500">Reservados: {{ w.frozenCredits | number }} · {{ w.currency }}</p>
            </section>
          }
          @if (resellerWallet(); as w) {
            <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
              <p class="text-sm text-neutral-500 mb-1">Carteira RESELLER</p>
              <p class="text-4xl font-bold text-neutral-900 dark:text-white">
                {{ w.availableCredits | number }}
                <span class="text-xl font-normal text-neutral-500">créditos</span>
              </p>
              <p class="mt-1 text-xs text-neutral-500">Reservados: {{ w.frozenCredits | number }} · {{ w.currency }}</p>
            </section>
          }
        </div>
      }

      <!-- Ações rápidas -->
      <div class="grid grid-cols-2 gap-3">
        <a routerLink="../credits"
          class="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <svg class="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-neutral-900 dark:text-white">Créditos</p>
            <p class="text-xs text-neutral-500">Ver histórico</p>
          </div>
        </a>

        <a routerLink="../refunds"
          class="flex items-center gap-3 bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 hover:border-neutral-400 dark:hover:border-neutral-600 transition-colors">
          <div class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
            <svg class="w-5 h-5 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
            </svg>
          </div>
          <div>
            <p class="text-sm font-medium text-neutral-900 dark:text-white">Reembolsos</p>
            <p class="text-xs text-neutral-500">Ver solicitações</p>
          </div>
        </a>
      </div>

      <!-- Notificações -->
      <section class="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-6">
        <h2 class="text-lg font-semibold mb-4 text-neutral-900 dark:text-white">Notificações</h2>

        @if (loadingNotifications()) {
          <div class="flex justify-center py-4">
            <div class="w-5 h-5 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        } @else if (notifications().length === 0) {
          <p class="text-neutral-500 text-sm text-center py-4">Nenhuma notificação no momento.</p>
        } @else {
          <div class="space-y-3">
            @for (notif of notifications(); track notif.createdAt) {
              <div class="flex items-start gap-3 p-3 rounded-lg" [class]="notifClass(notif.type)">
                <span class="text-lg">{{ notifIcon(notif.type) }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium text-neutral-900 dark:text-white">{{ notif.message }}</p>
                  <p class="text-xs text-neutral-500 mt-0.5">{{ notif.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                </div>
                <span class="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full" [class]="badgeClass(notif.type)">
                  {{ notif.type.replace('_', ' ') }}
                </span>
              </div>
            }
          </div>
        }
      </section>
    </div>
  `,
})
export class WalletBalancePage implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly platformWallet = signal<Wallet | null>(null);
  readonly resellerWallet = signal<Wallet | null>(null);
  readonly notifications = signal<WalletNotification[]>([]);
  readonly loadingWallets = signal(true);
  readonly loadingNotifications = signal(true);

  ngOnInit(): void {
    this.walletService
      .getPlatformWallet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (w) => { this.platformWallet.set(w); this.loadingWallets.set(false); },
        error: () => this.loadingWallets.set(false),
      });

    // Carteira RESELLER pode retornar 403 (cliente sem revenda) — ignorar silenciosamente.
    this.walletService
      .getResellerWallet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (w) => this.resellerWallet.set(w),
        error: () => this.resellerWallet.set(null),
      });

    this.walletService
      .getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (n) => { this.notifications.set(n); this.loadingNotifications.set(false); },
        error: () => this.loadingNotifications.set(false),
      });
  }

  notifClass(type: string): string {
    const map: Record<string, string> = {
      EXPIRING_SOON: 'bg-amber-50 dark:bg-amber-900/20',
      FROZEN: 'bg-blue-50 dark:bg-blue-900/20',
      DISPUTE_UPDATE: 'bg-red-50 dark:bg-red-900/20',
      REFUND_UPDATE: 'bg-green-50 dark:bg-green-900/20',
    };
    return map[type] ?? 'bg-neutral-50 dark:bg-neutral-800';
  }

  notifIcon(type: string): string {
    const map: Record<string, string> = {
      EXPIRING_SOON: '⏰',
      FROZEN: '🔒',
      DISPUTE_UPDATE: '⚠️',
      REFUND_UPDATE: '💸',
    };
    return map[type] ?? 'ℹ️';
  }

  badgeClass(type: string): string {
    const map: Record<string, string> = {
      EXPIRING_SOON: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
      FROZEN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
      DISPUTE_UPDATE: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
      REFUND_UPDATE: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
    };
    return map[type] ?? 'bg-neutral-100 text-neutral-800';
  }
}

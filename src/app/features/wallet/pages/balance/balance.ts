import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  Bell,
  CircleDollarSign,
  Clock3,
  History,
  LockKeyhole,
  LucideAngularModule,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  WalletCards,
} from 'lucide-angular';
import { Wallet, WalletNotification } from '../../../../core/models/wallet.model';
import { WalletService } from '../../services/wallet';

@Component({
  selector: 'app-wallet-balance',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, DatePipe, DecimalPipe, LucideAngularModule],
  template: `
    <main class="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-brand">
            <lucide-icon [img]="WalletCards" class="size-4" />
            Área financeira
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Minha Carteira
          </h1>
          <p class="mt-1 text-sm text-muted sm:text-base">
            Acompanhe seu saldo, movimentações e avisos importantes.
          </p>
        </div>

        <button
          type="button"
          class="btn-secondary self-start"
          [disabled]="loadingWallet() || loadingNotifications()"
          (click)="reload()"
        >
          <lucide-icon
            [img]="RefreshCw"
            class="size-4"
            [class.animate-spin]="loadingWallet() || loadingNotifications()"
          />
          Atualizar
        </button>
      </header>

      @if (walletError()) {
        <section
          class="flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-red-900/50 dark:bg-red-950/20"
          role="alert"
        >
          <div>
            <p class="font-semibold text-red-800 dark:text-red-300">
              Não foi possível carregar seu saldo
            </p>
            <p class="mt-1 text-sm text-red-700/80 dark:text-red-400">
              Verifique sua conexão e tente novamente.
            </p>
          </div>
          <button type="button" class="btn-secondary shrink-0" (click)="loadWallet()">
            Tentar novamente
          </button>
        </section>
      }

      @if (loadingWallet()) {
        <section class="wallet-hero min-h-64 animate-pulse" aria-label="Carregando saldo"></section>
        <section class="grid gap-4 sm:grid-cols-3">
          @for (item of [1, 2, 3]; track item) {
            <div class="h-28 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"></div>
          }
        </section>
      } @else if (wallet(); as currentWallet) {
        <section class="wallet-hero relative overflow-hidden p-6 text-white sm:p-8">
          <div class="wallet-glow wallet-glow-one"></div>
          <div class="wallet-glow wallet-glow-two"></div>

          <div class="relative z-10 flex h-full flex-col justify-between gap-8">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <span
                  class="flex size-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur"
                >
                  <lucide-icon [img]="CircleDollarSign" class="size-6" />
                </span>
                <div>
                  <p class="text-sm font-medium text-white/70">Saldo disponível</p>
                  <p class="mt-0.5 text-xs text-white/50">Pronto para usar em novos pedidos</p>
                </div>
              </div>
              <span
                class="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-white/90 backdrop-blur"
              >
                <lucide-icon [img]="ShieldCheck" class="size-3.5" />
                Saldo protegido
              </span>
            </div>

            <div>
              <div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <strong class="text-5xl font-bold tracking-tight sm:text-6xl">
                  {{ currentWallet.availableCredits | number: '1.0-0' }}
                </strong>
                <span class="text-lg font-medium text-white/70">créditos</span>
              </div>
              <div class="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/65">
                <span class="flex items-center gap-1.5">
                  <lucide-icon [img]="LockKeyhole" class="size-4" />
                  {{ currentWallet.frozenCredits | number: '1.0-0' }} reservados
                </span>
                <span class="hidden size-1 rounded-full bg-white/30 sm:block"></span>
                <span>{{ currentWallet.currency || 'CRÉDITOS' }}</span>
              </div>
            </div>
          </div>
        </section>

        <section class="grid gap-4 sm:grid-cols-3">
          <article class="summary-card">
            <span
              class="summary-icon bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
            >
              <lucide-icon [img]="ArrowDownLeft" class="size-5" />
            </span>
            <div>
              <p class="text-sm text-muted">Total recebido</p>
              <p class="mt-1 text-xl font-bold text-foreground">
                {{ currentWallet.totalReceived | number: '1.0-0' }}
                <span class="text-xs font-medium text-muted">créditos</span>
              </p>
            </div>
          </article>

          <article class="summary-card">
            <span
              class="summary-icon bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            >
              <lucide-icon [img]="ArrowUpRight" class="size-5" />
            </span>
            <div>
              <p class="text-sm text-muted">Total utilizado</p>
              <p class="mt-1 text-xl font-bold text-foreground">
                {{ currentWallet.totalSpent | number: '1.0-0' }}
                <span class="text-xs font-medium text-muted">créditos</span>
              </p>
            </div>
          </article>

          <article class="summary-card">
            <span
              class="summary-icon bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
            >
              <lucide-icon [img]="RotateCcw" class="size-5" />
            </span>
            <div>
              <p class="text-sm text-muted">Total reembolsado</p>
              <p class="mt-1 text-xl font-bold text-foreground">
                {{ currentWallet.totalRefunded | number: '1.0-0' }}
                <span class="text-xs font-medium text-muted">créditos</span>
              </p>
            </div>
          </article>
        </section>
      }

      <section class="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.55fr)]">
        <article class="overflow-hidden rounded-2xl border border-border bg-surface shadow-sm">
          <div class="flex items-center justify-between border-b border-border px-5 py-4 sm:px-6">
            <div>
              <h2 class="font-semibold text-foreground">Notificações da carteira</h2>
              <p class="mt-0.5 text-xs text-muted">Atualizações importantes sobre seus créditos</p>
            </div>
            <span
              class="flex size-9 items-center justify-center rounded-xl bg-surface-subtle text-muted"
            >
              <lucide-icon [img]="Bell" class="size-4.5" />
            </span>
          </div>

          @if (loadingNotifications()) {
            <div class="space-y-4 p-6" aria-label="Carregando notificações">
              @for (item of [1, 2, 3]; track item) {
                <div class="flex animate-pulse gap-3">
                  <div class="size-10 rounded-xl bg-neutral-200 dark:bg-neutral-800"></div>
                  <div class="flex-1 space-y-2 py-1">
                    <div class="h-3 w-4/5 rounded bg-neutral-200 dark:bg-neutral-800"></div>
                    <div class="h-2.5 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800"></div>
                  </div>
                </div>
              }
            </div>
          } @else if (notificationsError()) {
            <div class="flex flex-col items-center px-6 py-10 text-center">
              <span
                class="flex size-12 items-center justify-center rounded-2xl bg-red-50 text-red-500 dark:bg-red-950/30"
              >
                <lucide-icon [img]="Bell" class="size-5" />
              </span>
              <p class="mt-3 font-medium text-foreground">Não foi possível carregar os avisos</p>
              <button type="button" class="btn-link mt-2 text-sm" (click)="loadNotifications()">
                Tentar novamente
              </button>
            </div>
          } @else if (!notifications().length) {
            <div class="flex flex-col items-center px-6 py-12 text-center">
              <span
                class="flex size-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400"
              >
                <lucide-icon [img]="Sparkles" class="size-6" />
              </span>
              <p class="mt-4 font-semibold text-foreground">Tudo certo por aqui</p>
              <p class="mt-1 max-w-sm text-sm text-muted">
                Você não tem nenhuma notificação sobre seus créditos no momento.
              </p>
            </div>
          } @else {
            <div class="divide-y divide-border">
              @for (notification of notifications(); track notification.createdAt) {
                <div
                  class="group flex gap-3 px-5 py-4 transition-colors hover:bg-surface-subtle/60 sm:px-6"
                >
                  <span
                    class="notification-icon"
                    [class]="notificationIconClass(notification.type)"
                  >
                    <lucide-icon [img]="notificationIcon(notification.type)" class="size-4.5" />
                  </span>
                  <div class="min-w-0 flex-1">
                    <div
                      class="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
                    >
                      <p class="text-sm font-medium leading-5 text-foreground">
                        {{ notification.message }}
                      </p>
                      <span class="shrink-0 text-xs text-muted">
                        {{ notification.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                      </span>
                    </div>
                    <span
                      class="mt-2 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold"
                      [class]="notificationBadgeClass(notification.type)"
                    >
                      {{ notificationLabel(notification.type) }}
                    </span>
                  </div>
                </div>
              }
            </div>
          }
        </article>

        <aside class="space-y-4">
          <h2 class="text-sm font-semibold uppercase tracking-wider text-muted">Acesso rápido</h2>
          <a routerLink="../credits" class="action-card group">
            <span
              class="action-icon bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
            >
              <lucide-icon [img]="History" class="size-5" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-foreground">Histórico de créditos</p>
              <p class="mt-0.5 text-sm text-muted">Consulte todas as movimentações</p>
            </div>
            <lucide-icon
              [img]="ArrowRight"
              class="size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand"
            />
          </a>

          <a routerLink="../refunds" class="action-card group">
            <span
              class="action-icon bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
            >
              <lucide-icon [img]="RotateCcw" class="size-5" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-foreground">Meus reembolsos</p>
              <p class="mt-0.5 text-sm text-muted">Acompanhe suas solicitações</p>
            </div>
            <lucide-icon
              [img]="ArrowRight"
              class="size-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand"
            />
          </a>

          @if (wallet(); as currentWallet) {
            @if (currentWallet.expiredCredits > 0) {
              <div
                class="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/50 dark:bg-amber-950/20"
              >
                <div class="flex gap-3">
                  <lucide-icon
                    [img]="Clock3"
                    class="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400"
                  />
                  <div>
                    <p class="text-sm font-semibold text-amber-900 dark:text-amber-200">
                      Créditos expirados
                    </p>
                    <p class="mt-1 text-xs leading-5 text-amber-800/80 dark:text-amber-300/80">
                      {{ currentWallet.expiredCredits | number: '1.0-0' }} créditos expiraram e não
                      estão disponíveis para uso.
                    </p>
                  </div>
                </div>
              </div>
            }
          }
        </aside>
      </section>
    </main>
  `,
  styles: `
    .wallet-hero {
      min-height: 16rem;
      border-radius: 1.5rem;
      background:
        linear-gradient(135deg, rgba(255, 255, 255, 0.12), transparent 45%),
        linear-gradient(125deg, #111827 0%, #312e81 52%, #2563eb 100%);
      box-shadow: 0 24px 60px -28px rgba(37, 99, 235, 0.65);
    }

    .wallet-glow {
      position: absolute;
      border-radius: 9999px;
      filter: blur(1px);
      pointer-events: none;
    }

    .wallet-glow-one {
      right: -5rem;
      top: -8rem;
      width: 22rem;
      height: 22rem;
      background: radial-gradient(circle, rgba(96, 165, 250, 0.45), transparent 67%);
    }

    .wallet-glow-two {
      bottom: -9rem;
      left: 20%;
      width: 20rem;
      height: 20rem;
      background: radial-gradient(circle, rgba(167, 139, 250, 0.28), transparent 68%);
    }

    .summary-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      border: 1px solid var(--ui-border);
      border-radius: 1rem;
      background: var(--ui-surface);
      padding: 1rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }

    .summary-icon,
    .action-icon {
      display: flex;
      width: 2.75rem;
      height: 2.75rem;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      border-radius: 0.875rem;
    }

    .action-card {
      display: flex;
      align-items: center;
      gap: 0.875rem;
      border: 1px solid var(--ui-border);
      border-radius: 1rem;
      background: var(--ui-surface);
      padding: 1rem;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
      transition:
        border-color 150ms,
        box-shadow 150ms,
        transform 150ms;
    }

    .action-card:hover {
      border-color: color-mix(in srgb, var(--ui-primary) 45%, var(--ui-border));
      box-shadow: 0 12px 28px -18px rgba(37, 99, 235, 0.5);
      transform: translateY(-1px);
    }

    .notification-icon {
      display: flex;
      width: 2.5rem;
      height: 2.5rem;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      border-radius: 0.75rem;
    }
  `,
})
export class WalletBalancePage implements OnInit {
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly wallet = signal<Wallet | null>(null);
  readonly notifications = signal<WalletNotification[]>([]);
  readonly loadingWallet = signal(true);
  readonly loadingNotifications = signal(true);
  readonly walletError = signal(false);
  readonly notificationsError = signal(false);

  readonly ArrowDownLeft = ArrowDownLeft;
  readonly ArrowRight = ArrowRight;
  readonly ArrowUpRight = ArrowUpRight;
  readonly Bell = Bell;
  readonly CircleDollarSign = CircleDollarSign;
  readonly Clock3 = Clock3;
  readonly History = History;
  readonly LockKeyhole = LockKeyhole;
  readonly RefreshCw = RefreshCw;
  readonly RotateCcw = RotateCcw;
  readonly ShieldCheck = ShieldCheck;
  readonly Sparkles = Sparkles;
  readonly WalletCards = WalletCards;

  ngOnInit(): void {
    this.reload();
  }

  reload(): void {
    this.loadWallet();
    this.loadNotifications();
  }

  loadWallet(): void {
    this.loadingWallet.set(true);
    this.walletError.set(false);
    this.walletService
      .getWallet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (wallet) => {
          this.wallet.set(wallet);
          this.loadingWallet.set(false);
        },
        error: () => {
          this.walletError.set(true);
          this.loadingWallet.set(false);
        },
      });
  }

  loadNotifications(): void {
    this.loadingNotifications.set(true);
    this.notificationsError.set(false);
    this.walletService
      .getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (notifications) => {
          this.notifications.set(notifications);
          this.loadingNotifications.set(false);
        },
        error: () => {
          this.notificationsError.set(true);
          this.loadingNotifications.set(false);
        },
      });
  }

  notificationIcon(type: WalletNotification['type']) {
    const icons = {
      EXPIRING_SOON: Clock3,
      FROZEN: LockKeyhole,
      DISPUTE_UPDATE: ShieldCheck,
      REFUND_UPDATE: RotateCcw,
    };
    return icons[type] ?? Bell;
  }

  notificationLabel(type: WalletNotification['type']): string {
    const labels: Record<WalletNotification['type'], string> = {
      EXPIRING_SOON: 'Expiração próxima',
      FROZEN: 'Créditos reservados',
      DISPUTE_UPDATE: 'Atualização de disputa',
      REFUND_UPDATE: 'Atualização de reembolso',
    };
    return labels[type];
  }

  notificationIconClass(type: WalletNotification['type']): string {
    const classes: Record<WalletNotification['type'], string> = {
      EXPIRING_SOON: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
      FROZEN: 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
      DISPUTE_UPDATE: 'bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400',
      REFUND_UPDATE: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    };
    return classes[type];
  }

  notificationBadgeClass(type: WalletNotification['type']): string {
    const classes: Record<WalletNotification['type'], string> = {
      EXPIRING_SOON: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
      FROZEN: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
      DISPUTE_UPDATE: 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300',
      REFUND_UPDATE: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    };
    return classes[type];
  }
}

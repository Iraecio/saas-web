import { DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  inject,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import {
  LucideBell,
  LucideChevronDown,
  LucideCircleDollarSign,
  LucideLogOut,
  LucideSettings,
  LucideWalletCards,
  LucideDynamicIcon,
} from '@lucide/angular';
import { WalletNotification } from '../../../core/models/wallet.model';
import { AppStateService } from '../../../core/services/app-state';
import { AuthService } from '../../../core/services/auth';
import { WalletService } from '../../../features/wallet/services/wallet';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, LucideDynamicIcon, RouterLink],
  template: `
    <header
      class="relative z-20 flex h-[var(--ui-header-height)] shrink-0 items-center justify-between border-b border-brand-hover bg-brand px-4 text-white shadow-[0_2px_12px_rgb(0_50_110/22%)] sm:px-6"
    >
      <button
        type="button"
        class="inline-flex size-10 items-center justify-center rounded-md text-white/85 transition-colors hover:bg-white/12 hover:text-white"
        (click)="toggleSidebar.emit()"
        aria-label="Alternar sidebar"
      >
        ☰
      </button>

      <div class="flex items-center gap-1 sm:gap-3">
        @if (isClient()) {
          <a
            routerLink="/admin/wallet"
            class="flex min-h-10 items-center gap-1.5 rounded-md bg-white/12 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/18"
            aria-label="Abrir minha carteira"
          >
            <svg [lucideIcon]="LucideCircleDollarSign" class="size-5"></svg>
            @if (loadingWallet()) {
              <span class="h-4 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></span>
            } @else {
              <span>{{ availableCredits() | number: '1.0-0' }}</span>
              <span class="hidden font-normal text-white/70 sm:inline">créditos</span>
            }
          </a>

          <div class="relative">
            <button
              type="button"
              class="relative inline-flex size-10 items-center justify-center rounded-md text-white/85 transition-colors hover:bg-white/12 hover:text-white"
              (click)="toggleNotifications($event)"
              [attr.aria-expanded]="notificationsOpen()"
              aria-label="Notificações"
            >
              <svg [lucideIcon]="LucideBell" class="size-5"></svg>
              @if (notifications().length) {
                <span
                  class="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white"
                >
                  {{ notifications().length > 9 ? '9+' : notifications().length }}
                </span>
              }
            </button>

            @if (notificationsOpen()) {
              <div
                class="kuber-popover absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)]"
                (click)="$event.stopPropagation()"
              >
                <div class="border-b border-border px-4 py-3">
                  <p class="font-semibold text-foreground">Notificações</p>
                </div>
                <div class="max-h-80 overflow-y-auto">
                  @if (loadingNotifications()) {
                    <p class="px-4 py-6 text-center text-sm text-neutral-500">Carregando...</p>
                  } @else if (!notifications().length) {
                    <p class="px-4 py-6 text-center text-sm text-neutral-500">
                      Nenhuma notificação no momento.
                    </p>
                  } @else {
                    @for (notification of notifications(); track notification.createdAt) {
                      <div
                        class="border-b border-border px-4 py-3 transition-colors last:border-0 hover:bg-surface-subtle"
                      >
                        <p class="text-sm text-foreground">
                          {{ notification.message }}
                        </p>
                        <p class="mt-1 text-xs text-muted">
                          {{ notification.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                        </p>
                      </div>
                    }
                  }
                </div>
                <a
                  routerLink="/admin/wallet"
                  class="block border-t border-border px-4 py-2.5 text-center text-sm font-medium text-brand transition-colors hover:bg-surface-subtle"
                  (click)="notificationsOpen.set(false)"
                >
                  Ver minha carteira
                </a>
              </div>
            }
          </div>
        }

        <button
          type="button"
          class="inline-flex size-10 items-center justify-center rounded-md text-white/85 transition-colors hover:bg-white/12 hover:text-white"
          (click)="appState.toggleTheme()"
          [attr.aria-label]="appState.theme() === 'dark' ? 'Tema claro' : 'Tema escuro'"
        >
          {{ appState.theme() === 'dark' ? '☀️' : '🌙' }}
        </button>

        @if (appState.user(); as user) {
          <div class="relative border-l border-white/20 pl-2 sm:pl-3">
            <button
              type="button"
              class="flex min-h-10 items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-white/12"
              (click)="toggleUserMenu($event)"
              [attr.aria-expanded]="userMenuOpen()"
              aria-label="Abrir menu do usuário"
            >
              <div class="hidden text-right sm:block">
                <p class="max-w-44 truncate text-sm font-medium text-white">
                  {{ user.name || user.email }}
                </p>
                @if (user.role !== 'CLIENT') {
                  <p class="text-xs text-white/65">{{ user.role }}</p>
                }
              </div>
              <div
                class="flex size-9 items-center justify-center rounded-lg bg-white/16 text-sm font-semibold text-white ring-1 ring-white/15"
              >
                {{ (user.name || user.email)[0].toUpperCase() }}
              </div>
              <svg [lucideIcon]="LucideChevronDown" class="size-4 text-white/70"></svg>
            </button>

            @if (userMenuOpen()) {
              <div
                class="kuber-popover absolute right-0 z-50 mt-2 w-56 py-1"
                (click)="$event.stopPropagation()"
              >
                <a routerLink="/admin/settings" class="menu-item" (click)="userMenuOpen.set(false)">
                  <svg [lucideIcon]="LucideSettings" class="size-4"></svg>
                  Configuração
                </a>
                <a routerLink="/admin/wallet" class="menu-item" (click)="userMenuOpen.set(false)">
                  <svg [lucideIcon]="LucideWalletCards" class="size-4"></svg>
                  Minha Carteira
                </a>
                <button
                  type="button"
                  class="menu-item w-full text-red-600 dark:text-red-400"
                  [disabled]="loggingOut()"
                  (click)="handleLogout()"
                >
                  <svg [lucideIcon]="LucideLogOut" class="size-4"></svg>
                  {{ loggingOut() ? 'Saindo...' : 'Sair' }}
                </button>
              </div>
            }
          </div>
        }
      </div>
    </header>
  `,
  styles: `
    .menu-item {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.625rem 0.875rem;
      font-size: 0.875rem;
      color: inherit;
      transition: background-color 150ms;
    }
    .menu-item:hover {
      background-color: var(--ui-surface-subtle);
      color: var(--ui-primary);
    }
  `,
})
export class HeaderComponent implements OnInit {
  protected readonly appState = inject(AppStateService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly walletService = inject(WalletService);
  private readonly destroyRef = inject(DestroyRef);

  readonly toggleSidebar = output<void>();
  protected readonly loggingOut = signal(false);
  protected readonly userMenuOpen = signal(false);
  protected readonly notificationsOpen = signal(false);
  protected readonly availableCredits = signal(0);
  protected readonly notifications = signal<WalletNotification[]>([]);
  protected readonly loadingWallet = signal(false);
  protected readonly loadingNotifications = signal(false);

  protected readonly LucideBell = LucideBell;
  protected readonly LucideChevronDown = LucideChevronDown;
  protected readonly LucideCircleDollarSign = LucideCircleDollarSign;
  protected readonly LucideLogOut = LucideLogOut;
  protected readonly LucideSettings = LucideSettings;
  protected readonly LucideWalletCards = LucideWalletCards;

  ngOnInit(): void {
    if (!this.isClient()) return;

    this.loadingWallet.set(true);
    this.walletService
      .getWallet()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (wallet) => {
          this.availableCredits.set(wallet.availableCredits);
          this.loadingWallet.set(false);
        },
        error: () => this.loadingWallet.set(false),
      });

    this.loadingNotifications.set(true);
    this.walletService
      .getNotifications()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (notifications) => {
          this.notifications.set(notifications);
          this.loadingNotifications.set(false);
        },
        error: () => this.loadingNotifications.set(false),
      });
  }

  @HostListener('document:click')
  protected closeMenus(): void {
    this.userMenuOpen.set(false);
    this.notificationsOpen.set(false);
  }

  protected isClient(): boolean {
    return this.appState.userRole() === 'CLIENT';
  }

  protected toggleUserMenu(event: Event): void {
    event.stopPropagation();
    this.notificationsOpen.set(false);
    this.userMenuOpen.update((open) => !open);
  }

  protected toggleNotifications(event: Event): void {
    event.stopPropagation();
    this.userMenuOpen.set(false);
    this.notificationsOpen.update((open) => !open);
  }

  protected handleLogout(): void {
    if (this.loggingOut()) return;
    this.loggingOut.set(true);
    this.auth.logout().subscribe({
      next: () => this.finishLogout(),
      error: () => this.finishLogout(),
    });
  }

  private finishLogout(): void {
    this.loggingOut.set(false);
    this.userMenuOpen.set(false);
    this.router.navigate(['/auth/login']);
  }
}

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
  Bell,
  ChevronDown,
  CircleDollarSign,
  LogOut,
  Settings,
  WalletCards,
  LucideAngularModule,
} from 'lucide-angular';
import { WalletNotification } from '../../../core/models/wallet.model';
import { AppStateService } from '../../../core/services/app-state';
import { AuthService } from '../../../core/services/auth';
import { WalletService } from '../../../features/wallet/services/wallet';

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, DecimalPipe, LucideAngularModule, RouterLink],
  template: `
    <header
      class="flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 sm:px-6 dark:border-neutral-700 dark:bg-neutral-800"
    >
      <button
        type="button"
        class="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
        (click)="toggleSidebar.emit()"
        aria-label="Alternar sidebar"
      >
        ☰
      </button>

      <div class="flex items-center gap-1 sm:gap-3">
        @if (isClient()) {
          <a
            routerLink="/admin/wallet"
            class="flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-300 dark:hover:bg-amber-900/20"
            aria-label="Abrir minha carteira"
          >
            <lucide-icon [img]="CircleDollarSign" class="size-5" />
            @if (loadingWallet()) {
              <span class="h-4 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></span>
            } @else {
              <span>{{ availableCredits() | number: '1.0-0' }}</span>
              <span class="hidden font-normal text-neutral-500 sm:inline">créditos</span>
            }
          </a>

          <div class="relative">
            <button
              type="button"
              class="relative rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              (click)="toggleNotifications($event)"
              [attr.aria-expanded]="notificationsOpen()"
              aria-label="Notificações"
            >
              <lucide-icon [img]="Bell" class="size-5" />
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
                class="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
                (click)="$event.stopPropagation()"
              >
                <div class="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                  <p class="font-semibold text-neutral-900 dark:text-white">Notificações</p>
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
                        class="border-b border-neutral-100 px-4 py-3 last:border-0 dark:border-neutral-700"
                      >
                        <p class="text-sm text-neutral-800 dark:text-neutral-100">
                          {{ notification.message }}
                        </p>
                        <p class="mt-1 text-xs text-neutral-500">
                          {{ notification.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                        </p>
                      </div>
                    }
                  }
                </div>
                <a
                  routerLink="/admin/wallet"
                  class="block border-t border-neutral-200 px-4 py-2.5 text-center text-sm font-medium text-violet-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-violet-400 dark:hover:bg-neutral-700"
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
          class="rounded-lg p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
          (click)="appState.toggleTheme()"
          [attr.aria-label]="appState.theme() === 'dark' ? 'Tema claro' : 'Tema escuro'"
        >
          {{ appState.theme() === 'dark' ? '☀️' : '🌙' }}
        </button>

        @if (appState.user(); as user) {
          <div class="relative border-l border-neutral-200 pl-2 sm:pl-3 dark:border-neutral-700">
            <button
              type="button"
              class="flex items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-neutral-100 dark:hover:bg-neutral-700"
              (click)="toggleUserMenu($event)"
              [attr.aria-expanded]="userMenuOpen()"
              aria-label="Abrir menu do usuário"
            >
              <div class="hidden text-right sm:block">
                <p class="max-w-44 truncate text-sm font-medium text-neutral-900 dark:text-white">
                  {{ user.name || user.email }}
                </p>
                @if (user.role !== 'CLIENT') {
                  <p class="text-xs text-neutral-500">{{ user.role }}</p>
                }
              </div>
              <div
                class="flex size-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700 dark:bg-violet-900/30 dark:text-violet-300"
              >
                {{ (user.name || user.email)[0].toUpperCase() }}
              </div>
              <lucide-icon [img]="ChevronDown" class="size-4 text-neutral-500" />
            </button>

            @if (userMenuOpen()) {
              <div
                class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
                (click)="$event.stopPropagation()"
              >
                <a routerLink="/admin/settings" class="menu-item" (click)="userMenuOpen.set(false)">
                  <lucide-icon [img]="Settings" class="size-4" />
                  Configuração
                </a>
                <a routerLink="/admin/wallet" class="menu-item" (click)="userMenuOpen.set(false)">
                  <lucide-icon [img]="WalletCards" class="size-4" />
                  Minha Carteira
                </a>
                <button
                  type="button"
                  class="menu-item w-full text-red-600 dark:text-red-400"
                  [disabled]="loggingOut()"
                  (click)="handleLogout()"
                >
                  <lucide-icon [img]="LogOut" class="size-4" />
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
      background-color: rgb(245 245 245);
    }
    :host-context(.dark) .menu-item:hover {
      background-color: rgb(64 64 64);
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

  protected readonly Bell = Bell;
  protected readonly ChevronDown = ChevronDown;
  protected readonly CircleDollarSign = CircleDollarSign;
  protected readonly LogOut = LogOut;
  protected readonly Settings = Settings;
  protected readonly WalletCards = WalletCards;

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

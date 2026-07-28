import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import {
  ChevronLeft,
  ChevronRight,
  Edit3,
  LoaderCircle,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundX,
  Users,
  X,
  LucideAngularModule,
} from 'lucide-angular';
import { filter, switchMap } from 'rxjs';
import { UserRole } from '../../../../core/models/user.model';
import { AppStateService } from '../../../../core/services/app-state';
import { NotificationService } from '../../../../core/services/notification';
import { ConfirmDialogComponent } from '../../../../shared/ui/dialog/confirm-dialog';
import { ResellerService } from '../../../resellers/services/reseller';
import { UserListItem } from '../../models/user.model';
import { UserService } from '../../services/user';

const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: 'Super admin',
  ADMIN: 'Administrador',
  RESELLER: 'Revendedor',
  RESELLER_MANAGER: 'Gerente de revenda',
  VOICE_ACTOR: 'Locutor',
  PRODUCER: 'Produtor',
  CLIENT: 'Cliente',
};

@Component({
  selector: 'app-users-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe, LucideAngularModule],
  template: `
    <main class="mx-auto max-w-[1500px] space-y-5 p-4 sm:p-6 lg:p-8">
      <header
        class="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between"
      >
        <div class="min-w-0">
          <div
            class="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-brand"
          >
            <lucide-icon [img]="ShieldCheck" class="size-4" /> Administração da plataforma
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Usuários</h1>
          <p class="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Consulte contas, papéis e acessos. Alterações de perfil e permissões ficam disponíveis
            em cada usuário.
          </p>
        </div>
        <button
          type="button"
          class="btn-secondary self-start sm:self-auto"
          [disabled]="loading()"
          (click)="reload()"
        >
          <lucide-icon [img]="RefreshCw" class="size-4" [class.animate-spin]="loading()" />
          Atualizar
        </button>
      </header>

      <section class="grid gap-3 sm:grid-cols-2">
        <article class="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                {{ roleFilter() ? 'Total no filtro' : 'Total cadastrado' }}
              </p>
              <p class="mt-1 text-2xl font-bold tabular-nums text-foreground">{{ total() }}</p>
            </div>
            <span class="flex size-10 items-center justify-center rounded-lg bg-brand/10 text-brand"
              ><lucide-icon [img]="Users" class="size-5"
            /></span>
          </div>
        </article>
        <article class="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs font-semibold uppercase tracking-wide text-muted">
                Exibidos nesta página
              </p>
              <p class="mt-1 text-2xl font-bold tabular-nums text-foreground">
                {{ visibleUsers().length }}
              </p>
            </div>
            <span class="text-right text-xs leading-5 text-muted"
              >Página {{ page() }}<br />de {{ totalPages() }}</span
            >
          </div>
        </article>
      </section>

      <section
        class="overflow-hidden rounded-xl border border-border bg-surface shadow-sm"
        aria-labelledby="users-table-title"
      >
        <div class="border-b border-border p-4 sm:p-5">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 id="users-table-title" class="font-bold text-foreground">Contas da plataforma</h2>
              <p class="mt-1 text-xs text-muted">
                A busca atua nos registros da página carregada; o filtro por papel consulta toda a
                base.
              </p>
            </div>
            <div class="grid gap-3 sm:grid-cols-[minmax(240px,1fr)_220px] lg:w-[580px]">
              <label class="relative block"
                ><span class="sr-only">Buscar nesta página</span>
                <lucide-icon
                  [img]="Search"
                  class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                />
                <input
                  type="search"
                  class="form-input h-11 pl-10 pr-10"
                  placeholder="Nome ou e-mail nesta página"
                  [value]="search()"
                  (input)="search.set($any($event.target).value)"
                />
                @if (search()) {
                  <button
                    type="button"
                    class="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-foreground"
                    aria-label="Limpar busca"
                    (click)="search.set('')"
                  >
                    <lucide-icon [img]="X" class="size-4" />
                  </button>
                }
              </label>
              <label
                ><span class="sr-only">Filtrar por papel</span>
                <select
                  class="form-input h-11"
                  [value]="roleFilter()"
                  (change)="setRole($any($event.target).value)"
                >
                  <option value="">Todos os papéis</option>
                  @for (role of roles; track role) {
                    <option [value]="role">{{ roleLabel(role) }}</option>
                  }
                </select>
              </label>
            </div>
          </div>
        </div>

        @if (error()) {
          <div
            class="m-4 rounded-lg border border-danger/30 bg-danger/5 px-4 py-5 text-center sm:m-5"
          >
            <p class="font-semibold text-danger">Não foi possível carregar os usuários</p>
            <p class="mt-1 text-sm text-muted">{{ error() }}</p>
            <button type="button" class="btn-secondary mt-4" (click)="reload()">
              <lucide-icon [img]="RefreshCw" class="size-4" /> Tentar novamente
            </button>
          </div>
        } @else if (loading()) {
          <div
            class="flex min-h-72 flex-col items-center justify-center gap-3 text-muted"
            aria-live="polite"
          >
            <lucide-icon [img]="LoaderCircle" class="size-7 animate-spin text-brand" />
            <p class="text-sm">Carregando usuários…</p>
          </div>
        } @else if (!visibleUsers().length) {
          <div class="flex min-h-72 flex-col items-center justify-center px-5 text-center">
            <span
              class="flex size-12 items-center justify-center rounded-full bg-surface-subtle text-muted"
              ><lucide-icon [img]="Users" class="size-6"
            /></span>
            <h3 class="mt-4 font-semibold text-foreground">Nenhum usuário encontrado</h3>
            <p class="mt-1 max-w-sm text-sm text-muted">
              {{
                search()
                  ? 'Limpe a busca ou tente outro nome ou e-mail.'
                  : 'Não há usuários para o papel selecionado.'
              }}
            </p>
            @if (search()) {
              <button type="button" class="btn-secondary mt-4" (click)="search.set('')">
                Limpar busca
              </button>
            }
          </div>
        } @else {
          <div class="hidden overflow-x-auto md:block">
            <table class="w-full min-w-[1050px] border-collapse">
              <thead class="bg-surface-subtle/70">
                <tr class="border-b border-border">
                  <th
                    class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Usuário
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Papel
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Revenda
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Status
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Último acesso
                  </th>
                  <th
                    class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Cadastro
                  </th>
                  <th
                    class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted"
                  >
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                @for (user of visibleUsers(); track user.id) {
                  <tr class="border-b border-border last:border-0 hover:bg-surface-subtle/50">
                    <td class="px-5 py-4">
                      <div class="flex min-w-0 items-center gap-3">
                        <span
                          class="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand"
                          >{{ initials(user) }}</span
                        >
                        <div class="min-w-0">
                          <p class="truncate text-sm font-semibold text-foreground">
                            {{ user.name || 'Nome não informado' }}
                          </p>
                          <p class="truncate text-xs text-muted">{{ user.email }}</p>
                        </div>
                      </div>
                    </td>
                    <td class="px-4 py-4">
                      <span
                        class="inline-flex rounded-md bg-surface-subtle px-2 py-1 text-xs font-semibold text-foreground"
                        >{{ roleLabel(user.role) }}</span
                      >
                    </td>
                    <td class="max-w-52 px-4 py-4">
                      <p
                        class="truncate text-sm font-medium text-foreground"
                        [title]="resellerTitle(user)"
                      >
                        {{ resellerName(user) }}
                      </p>
                    </td>
                    <td class="px-4 py-4">
                      <span
                        class="inline-flex items-center gap-1.5 text-xs font-semibold"
                        [class.text-accent]="user.status === 'active'"
                        [class.text-muted]="user.status === 'disabled'"
                        ><span class="size-1.5 rounded-full bg-current"></span
                        >{{ user.status === 'active' ? 'Ativo' : 'Desativado' }}</span
                      >
                    </td>
                    <td class="px-4 py-4 text-sm text-muted">
                      {{
                        user.lastLoginAt
                          ? (user.lastLoginAt | date: 'dd/MM/yyyy, HH:mm')
                          : 'Nunca acessou'
                      }}
                    </td>
                    <td class="px-4 py-4 text-sm text-muted">
                      {{ user.createdAt ? (user.createdAt | date: 'dd/MM/yyyy') : '—' }}
                    </td>
                    <td class="px-5 py-4">
                      <div class="flex justify-end gap-1">
                        <button
                          type="button"
                          class="btn-icon"
                          [attr.aria-label]="'Editar ' + (user.name || user.email)"
                          title="Editar usuário"
                          (click)="edit(user)"
                        >
                          <lucide-icon [img]="Edit3" class="size-4" />
                        </button>
                        @if (canDeactivate(user)) {
                          <button
                            type="button"
                            class="btn-icon hover:!bg-danger/10 hover:!text-danger"
                            [attr.aria-label]="'Desativar ' + (user.name || user.email)"
                            title="Desativar usuário"
                            (click)="deactivate(user)"
                          >
                            <lucide-icon [img]="UserRoundX" class="size-4" />
                          </button>
                        }
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>

          <div class="divide-y divide-border md:hidden">
            @for (user of visibleUsers(); track user.id) {
              <article class="p-4">
                <div class="flex items-start gap-3">
                  <span
                    class="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand"
                    >{{ initials(user) }}</span
                  >
                  <div class="min-w-0 flex-1">
                    <h3 class="truncate text-sm font-semibold text-foreground">
                      {{ user.name || 'Nome não informado' }}
                    </h3>
                    <p class="truncate text-xs text-muted">{{ user.email }}</p>
                    <div class="mt-2 flex flex-wrap items-center gap-2">
                      <span class="rounded-md bg-surface-subtle px-2 py-1 text-xs font-semibold">{{
                        roleLabel(user.role)
                      }}</span
                      ><span
                        class="text-xs font-semibold"
                        [class.text-accent]="user.status === 'active'"
                        [class.text-muted]="user.status === 'disabled'"
                        >{{ user.status === 'active' ? '● Ativo' : '● Desativado' }}</span
                      >
                    </div>
                  </div>
                </div>
                <dl class="mt-4 grid grid-cols-2 gap-3 text-xs">
                  <div class="col-span-2">
                    <dt class="text-muted">Revenda</dt>
                    <dd
                      class="mt-1 truncate font-medium text-foreground"
                      [title]="resellerTitle(user)"
                    >
                      {{ resellerName(user) }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-muted">Último acesso</dt>
                    <dd class="mt-1 font-medium text-foreground">
                      {{ user.lastLoginAt ? (user.lastLoginAt | date: 'dd/MM/yyyy') : 'Nunca' }}
                    </dd>
                  </div>
                  <div>
                    <dt class="text-muted">Cadastro</dt>
                    <dd class="mt-1 font-medium text-foreground">
                      {{ user.createdAt ? (user.createdAt | date: 'dd/MM/yyyy') : '—' }}
                    </dd>
                  </div>
                </dl>
                <div class="mt-4 flex gap-2">
                  <button type="button" class="btn-secondary flex-1" (click)="edit(user)">
                    <lucide-icon [img]="Edit3" class="size-4" /> Editar
                  </button>
                  @if (canDeactivate(user)) {
                    <button type="button" class="btn-ghost text-danger" (click)="deactivate(user)">
                      <lucide-icon [img]="UserRoundX" class="size-4" /> Desativar
                    </button>
                  }
                </div>
              </article>
            }
          </div>
        }

        @if (!error() && !loading() && totalPages() > 1) {
          <footer
            class="flex flex-col gap-3 border-t border-border px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          >
            <p class="text-center text-xs text-muted sm:text-left">
              Exibindo {{ pageStart() }}–{{ pageEnd() }} de {{ total() }} usuários
            </p>
            <div class="flex items-center justify-center gap-2">
              <button
                type="button"
                class="btn-secondary px-3"
                [disabled]="page() <= 1"
                (click)="goToPage(page() - 1)"
              >
                <lucide-icon [img]="ChevronLeft" class="size-4" />
                <span class="hidden sm:inline">Anterior</span></button
              ><span class="min-w-20 text-center text-xs font-semibold text-muted"
                >{{ page() }} / {{ totalPages() }}</span
              ><button
                type="button"
                class="btn-secondary px-3"
                [disabled]="page() >= totalPages()"
                (click)="goToPage(page() + 1)"
              >
                <span class="hidden sm:inline">Próxima</span>
                <lucide-icon [img]="ChevronRight" class="size-4" />
              </button>
            </div>
          </footer>
        }
      </section>
    </main>
  `,
})
export class UsersListComponent {
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly notifications = inject(NotificationService);
  private readonly appState = inject(AppStateService);
  private readonly resellerService = inject(ResellerService);
  private readonly destroyRef = inject(DestroyRef);

  readonly Search = Search;
  readonly RefreshCw = RefreshCw;
  readonly Users = Users;
  readonly ShieldCheck = ShieldCheck;
  readonly LoaderCircle = LoaderCircle;
  readonly X = X;
  readonly ChevronLeft = ChevronLeft;
  readonly ChevronRight = ChevronRight;
  readonly Edit3 = Edit3;
  readonly UserRoundX = UserRoundX;
  readonly roles: UserRole[] = [
    'SUPER_ADMIN',
    'ADMIN',
    'RESELLER',
    'RESELLER_MANAGER',
    'VOICE_ACTOR',
    'PRODUCER',
    'CLIENT',
  ];
  readonly search = signal('');
  readonly roleFilter = signal<'' | UserRole>('');
  readonly page = signal(1);
  readonly total = signal(0);
  readonly totalPages = signal(1);
  readonly users = signal<UserListItem[]>([]);
  readonly resellerNames = signal(new Map<string, string>());
  readonly resellerNamesByOwner = signal(new Map<string, string>());
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly limit = 20;
  readonly reloadKey = signal(0);

  readonly visibleUsers = computed(() => {
    const term = this.search().trim().toLocaleLowerCase('pt-BR');
    if (!term) return this.users();
    return this.users().filter(
      (user) =>
        (user.name || '').toLocaleLowerCase('pt-BR').includes(term) ||
        user.email.toLocaleLowerCase('pt-BR').includes(term),
    );
  });
  readonly pageStart = computed(() => (this.total() ? (this.page() - 1) * this.limit + 1 : 0));
  readonly pageEnd = computed(() => Math.min(this.page() * this.limit, this.total()));

  constructor() {
    this.resellerService
      .list()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (resellers) => {
          this.resellerNames.set(
            new Map(resellers.map((reseller) => [reseller.id, reseller.name])),
          );
          this.resellerNamesByOwner.set(
            new Map(
              resellers
                .filter((reseller) => reseller.ownerId)
                .map((reseller) => [reseller.ownerId!, reseller.name]),
            ),
          );
        },
        error: () => {
          this.resellerNames.set(new Map());
          this.resellerNamesByOwner.set(new Map());
        },
      });

    effect((cleanup) => {
      const page = this.page();
      const role = this.roleFilter();
      this.reloadKey();
      this.loading.set(true);
      this.error.set(null);
      const subscription = this.userService
        .list({ page, limit: this.limit, ...(role ? { role } : {}) })
        .subscribe({
          next: ({ users, meta }) => {
            this.users.set(users);
            this.total.set(meta.total);
            this.totalPages.set(Math.max(1, meta.totalPages));
            this.loading.set(false);
          },
          error: (error: Error) => {
            this.users.set([]);
            this.error.set(error.message || 'Erro inesperado.');
            this.loading.set(false);
          },
        });
      cleanup(() => subscription.unsubscribe());
    });
  }

  roleLabel(role: UserRole): string {
    return ROLE_LABELS[role];
  }
  resellerName(user: UserListItem): string {
    const ownedResellerName = this.resellerNamesByOwner().get(user.id);
    if (ownedResellerName) return ownedResellerName;
    if (!user.resellerId) {
      return user.role === 'SUPER_ADMIN' || user.role === 'ADMIN' ? 'Plataforma' : 'Sem revenda';
    }
    return this.resellerNames().get(user.resellerId) ?? 'Revenda não encontrada';
  }
  resellerTitle(user: UserListItem): string {
    const name = this.resellerName(user);
    return user.resellerId && name === 'Revenda não encontrada'
      ? `${name} (${user.resellerId})`
      : name;
  }
  initials(user: UserListItem): string {
    const source = user.name?.trim() || user.email;
    return source
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  setRole(role: '' | UserRole): void {
    this.search.set('');
    this.page.set(1);
    this.roleFilter.set(role);
  }
  goToPage(page: number): void {
    this.search.set('');
    this.page.set(page);
  }
  reload(): void {
    this.reloadKey.update((value) => value + 1);
  }
  edit(user: UserListItem): void {
    void this.router.navigate(['/admin/users', user.id, 'edit']);
  }
  canDeactivate(user: UserListItem): boolean {
    return (
      user.status === 'active' &&
      user.id !== this.appState.user()?.id &&
      this.appState.userRole() === 'SUPER_ADMIN'
    );
  }

  deactivate(user: UserListItem): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Desativar usuário?',
          description: `${user.name || user.email} perderá o acesso à plataforma. A conta poderá ser reativada posteriormente pela edição.`,
          confirmLabel: 'Desativar',
          destructive: true,
        },
      })
      .afterClosed()
      .pipe(
        filter(Boolean),
        switchMap(() => this.userService.remove(user.id)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.notifications.success('Usuário desativado com sucesso.');
          this.reload();
        },
        error: (error: Error) =>
          this.notifications.error(error.message || 'Não foi possível desativar o usuário.'),
      });
  }
}

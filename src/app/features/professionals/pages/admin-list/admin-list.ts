import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CurrencyPipe, NgTemplateOutlet } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import {
  ProfessionalAdminFilters,
  ProfessionalAdminItem,
  ProfessionalAdminPage,
} from '../../../../core/models/professional-admin.model';
import { ProfessionalAdminService } from '../../services/professional-admin';

const DEFAULT_FILTERS: ProfessionalAdminFilters = {
  query: '',
  role: '',
  scope: '',
  accountStatus: '',
  verificationStatus: '',
  sort: 'name',
  page: 1,
  pageSize: 20,
};

@Component({
  selector: 'app-professional-admin-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, CurrencyPipe, NgTemplateOutlet],
  template: `
    <main class="mx-auto max-w-[1440px] space-y-7 p-4 sm:p-6 lg:p-8" id="main-content">
      <header class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div class="max-w-2xl">
          <p
            class="mb-2 text-xs font-semibold tracking-[.18em] text-emerald-700 dark:text-emerald-400"
          >
            OPERAÇÃO · PROFISSIONAIS
          </p>
          <h1
            class="text-balance text-3xl font-semibold tracking-[-.035em] text-neutral-950 dark:text-neutral-50 sm:text-4xl"
          >
            Profissionais, sem pontos cegos
          </h1>
          <p class="mt-2 max-w-xl text-sm leading-6 text-neutral-600 dark:text-neutral-400">
            Consulte contas globais e de revendas, acompanhe a operação e resolva bloqueios sem sair
            deste fluxo.
          </p>
        </div>
        <button
          type="button"
          class="btn-secondary min-h-11 lg:hidden"
          (click)="filtersOpen.set(true)"
          [attr.aria-expanded]="filtersOpen()"
        >
          Filtros
          <span class="ml-1 rounded bg-neutral-200 px-1.5 text-xs dark:bg-neutral-700">{{
            activeFilterCount()
          }}</span>
        </button>
      </header>

      @if (page(); as result) {
        <section aria-label="Resumo" class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          @for (metric of metrics(result); track metric.label) {
            <article
              class="rounded-2xl bg-white p-4 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
            >
              <p class="text-xs font-medium text-neutral-500">{{ metric.label }}</p>
              <p
                class="mt-2 text-2xl font-semibold tabular-nums tracking-tight text-neutral-950 dark:text-white"
              >
                {{ metric.value }}
              </p>
            </article>
          }
        </section>
      } @else if (loading()) {
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Carregando resumo">
          @for (_ of [1, 2, 3, 4, 5]; track $index) {
            <div class="h-24 animate-pulse rounded-2xl bg-neutral-200/70 dark:bg-neutral-800"></div>
          }
        </div>
      }

      <section class="grid items-start gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
        <aside
          class="hidden rounded-2xl bg-white p-5 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800 lg:block"
          aria-label="Filtros da listagem"
        >
          <ng-container [ngTemplateOutlet]="filterFields" />
        </aside>

        <div class="min-w-0 space-y-4">
          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label class="relative block flex-1">
              <span class="sr-only">Buscar profissional</span>
              <input
                class="form-input min-h-11 w-full pl-4"
                type="search"
                placeholder="Buscar por nome, e-mail ou ID"
                [value]="filters().query"
                (input)="search($any($event.target).value)"
              />
            </label>
            <select
              class="form-input min-h-11 sm:w-52"
              aria-label="Ordenar profissionais"
              [value]="filters().sort"
              (change)="setFilter('sort', $any($event.target).value)"
            >
              <option value="name">Nome A–Z</option>
              <option value="lastLoginAt">Acesso recente</option>
              <option value="orders">Mais pedidos</option>
              <option value="wallet">Maior carteira</option>
            </select>
          </div>

          @if (error()) {
            <div
              role="alert"
              class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200"
            >
              <p class="font-semibold">Não foi possível carregar os profissionais</p>
              <p class="mt-1">{{ error() }}</p>
              <button class="mt-3 font-semibold underline underline-offset-4" (click)="load()">
                Tentar novamente
              </button>
            </div>
          } @else if (loading()) {
            <div class="space-y-2" aria-live="polite">
              <span class="sr-only">Carregando profissionais</span>
              @for (_ of [1, 2, 3, 4, 5, 6]; track $index) {
                <div
                  class="h-[76px] animate-pulse rounded-xl bg-neutral-200/70 dark:bg-neutral-800"
                ></div>
              }
            </div>
          } @else if (page()?.items?.length === 0) {
            <div
              class="rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center dark:border-neutral-700"
            >
              <p class="font-semibold text-neutral-900 dark:text-white">
                Nenhum profissional corresponde aos filtros
              </p>
              <p class="mt-1 text-sm text-neutral-500">
                Revise a busca ou limpe os filtros selecionados.
              </p>
              <button class="btn-secondary mt-5" (click)="clearFilters()">Limpar filtros</button>
            </div>
          } @else {
            <div
              class="hidden overflow-hidden rounded-2xl ring-1 ring-neutral-200/80 dark:ring-neutral-800 md:block"
            >
              <table class="w-full text-left text-sm">
                <thead
                  class="bg-neutral-100/80 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
                >
                  <tr>
                    <th class="px-5 py-3 font-medium">Profissional</th>
                    <th class="px-4 py-3 font-medium">Atuação</th>
                    <th class="px-4 py-3 font-medium">Conta</th>
                    <th class="px-4 py-3 font-medium">Operação</th>
                    <th class="px-5 py-3 text-right font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody
                  class="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-950"
                >
                  @for (item of page()!.items; track item.userId) {
                    <tr class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/70">
                      <td class="px-5 py-4">
                        <div class="flex items-center gap-3">
                          <div
                            class="grid size-10 shrink-0 place-items-center rounded-xl bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                          >
                            {{ initials(item.name) }}
                          </div>
                          <div class="min-w-0">
                            <a
                              class="font-semibold text-neutral-950 hover:underline dark:text-white"
                              [routerLink]="[item.userId]"
                              >{{ item.name }}</a
                            >
                            <p class="truncate text-xs text-neutral-500">
                              {{ item.email || item.userId }}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td class="px-4 py-4">
                        <p>{{ roleLabel(item) }}</p>
                        <p class="text-xs text-neutral-500">{{ scopeLabel(item) }}</p>
                      </td>
                      <td class="px-4 py-4">
                        <span
                          class="inline-flex items-center gap-1.5 font-medium"
                          [class.text-red-700]="item.accountStatus === 'BLOCKED'"
                          ><span
                            class="size-1.5 rounded-full"
                            [class.bg-emerald-500]="item.accountStatus === 'ACTIVE'"
                            [class.bg-red-500]="item.accountStatus === 'BLOCKED'"
                          ></span
                          >{{ item.accountStatus === 'ACTIVE' ? 'Ativa' : 'Bloqueada' }}</span
                        >
                        <p class="mt-1 text-xs text-neutral-500">
                          {{ item.verificationStatus || 'Sem verificação' }}
                        </p>
                      </td>
                      <td class="px-4 py-4 tabular-nums">
                        <p>{{ item.activeOrders || 0 }} pedidos ativos</p>
                        <p class="text-xs text-neutral-500">
                          {{ (item.walletBalanceCents || 0) / 100 | currency: 'BRL' }}
                        </p>
                      </td>
                      <td class="px-5 py-4 text-right">
                        <a
                          class="btn-secondary inline-flex min-h-10 items-center"
                          [routerLink]="[item.userId]"
                          >Gerenciar</a
                        >
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="grid gap-3 md:hidden">
              @for (item of page()!.items; track item.userId) {
                <article
                  class="rounded-2xl bg-white p-5 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
                >
                  <div class="flex items-start gap-3">
                    <div
                      class="grid size-11 shrink-0 place-items-center rounded-xl bg-emerald-100 font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    >
                      {{ initials(item.name) }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <h2 class="truncate font-semibold text-neutral-950 dark:text-white">
                        {{ item.name }}
                      </h2>
                      <p class="text-sm text-neutral-500">
                        {{ roleLabel(item) }} · {{ scopeLabel(item) }}
                      </p>
                    </div>
                    <span
                      class="text-xs font-medium"
                      [class.text-emerald-700]="item.accountStatus === 'ACTIVE'"
                      [class.text-red-600]="item.accountStatus === 'BLOCKED'"
                      >{{ item.accountStatus === 'ACTIVE' ? 'Ativa' : 'Bloqueada' }}</span
                    >
                  </div>
                  <dl
                    class="my-4 grid grid-cols-2 gap-3 border-y border-neutral-200 py-4 text-sm dark:border-neutral-800"
                  >
                    <div>
                      <dt class="text-xs text-neutral-500">Pedidos ativos</dt>
                      <dd class="mt-1 font-semibold tabular-nums">{{ item.activeOrders || 0 }}</dd>
                    </div>
                    <div>
                      <dt class="text-xs text-neutral-500">Verificação</dt>
                      <dd class="mt-1 font-semibold">
                        {{ item.verificationStatus || 'Pendente' }}
                      </dd>
                    </div>
                  </dl>
                  <a
                    class="btn-primary flex min-h-11 w-full items-center justify-center"
                    [routerLink]="[item.userId]"
                    >Gerenciar profissional</a
                  >
                </article>
              }
            </div>

            <nav class="flex items-center justify-between pt-2" aria-label="Paginação">
              <p class="text-sm text-neutral-500">{{ page()!.total }} profissionais</p>
              <div class="flex gap-2">
                <button
                  class="btn-secondary min-h-11"
                  [disabled]="filters().page === 1"
                  (click)="changePage(-1)"
                >
                  Anterior</button
                ><button
                  class="btn-secondary min-h-11"
                  [disabled]="filters().page >= page()!.totalPages"
                  (click)="changePage(1)"
                >
                  Próxima
                </button>
              </div>
            </nav>
          }
        </div>
      </section>
    </main>

    @if (filtersOpen()) {
      <div
        class="fixed inset-0 z-40 bg-neutral-950/45 lg:hidden"
        (click)="filtersOpen.set(false)"
      ></div>
      <aside
        class="fixed inset-y-0 right-0 z-50 w-[min(90vw,22rem)] overflow-y-auto bg-white p-6 shadow-2xl dark:bg-neutral-950 lg:hidden"
        role="dialog"
        aria-modal="true"
        aria-label="Filtros"
      >
        <div class="mb-6 flex items-center justify-between">
          <h2 class="text-lg font-semibold">Filtros</h2>
          <button class="btn-secondary min-h-11" (click)="filtersOpen.set(false)">Fechar</button>
        </div>
        <ng-container [ngTemplateOutlet]="filterFields" />
      </aside>
    }

    <ng-template #filterFields
      ><div class="space-y-5">
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="role-filter">Tipo</label
          ><select
            id="role-filter"
            class="form-input min-h-11 w-full"
            [value]="filters().role"
            (change)="setFilter('role', $any($event.target).value)"
          >
            <option value="">Todos</option>
            <option value="VOICE_ACTOR">Locutores</option>
            <option value="PRODUCER">Produtores</option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="scope-filter">Escopo</label
          ><select
            id="scope-filter"
            class="form-input min-h-11 w-full"
            [value]="filters().scope"
            (change)="setFilter('scope', $any($event.target).value)"
          >
            <option value="">Global e revendas</option>
            <option value="GLOBAL">Global</option>
            <option value="PARTICULAR">Revenda</option>
          </select>
        </div>
        <div>
          <label class="mb-1.5 block text-sm font-medium" for="status-filter">Conta</label
          ><select
            id="status-filter"
            class="form-input min-h-11 w-full"
            [value]="filters().accountStatus"
            (change)="setFilter('accountStatus', $any($event.target).value)"
          >
            <option value="">Ativas e bloqueadas</option>
            <option value="ACTIVE">Ativas</option>
            <option value="BLOCKED">Bloqueadas</option>
          </select>
        </div>
        <button
          class="w-full text-left text-sm font-semibold text-neutral-600 underline underline-offset-4 dark:text-neutral-300"
          (click)="clearFilters()"
        >
          Limpar todos os filtros
        </button>
      </div></ng-template
    >
  `,
})
export class ProfessionalAdminListPage {
  private readonly service = inject(ProfessionalAdminService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput = new Subject<string>();
  readonly filters = signal<ProfessionalAdminFilters>(this.readFilters());
  readonly page = signal<ProfessionalAdminPage | null>(null);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly filtersOpen = signal(false);
  readonly activeFilterCount = computed(
    () =>
      [
        this.filters().role,
        this.filters().scope,
        this.filters().accountStatus,
        this.filters().verificationStatus,
      ].filter(Boolean).length,
  );
  constructor() {
    this.searchInput
      .pipe(debounceTime(300), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) => this.setFilter('query', query));
    this.load();
  }
  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service
      .list(this.filters())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.page.set(page);
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(error.message ?? 'Verifique sua conexão e tente novamente.');
          this.loading.set(false);
        },
      });
  }
  search(query: string): void {
    this.searchInput.next(query);
  }
  setFilter(key: keyof ProfessionalAdminFilters, value: string): void {
    this.filters.update((f) => ({ ...f, [key]: value, page: key === 'page' ? Number(value) : 1 }));
    this.persistAndLoad();
  }
  changePage(step: number): void {
    this.filters.update((f) => ({ ...f, page: f.page + step }));
    this.persistAndLoad();
  }
  clearFilters(): void {
    this.filters.set({ ...DEFAULT_FILTERS });
    this.filtersOpen.set(false);
    this.persistAndLoad();
  }
  metrics(page: ProfessionalAdminPage) {
    return [
      { label: 'Total', value: page.counters.total },
      { label: 'Locutores', value: page.counters.voiceActors },
      { label: 'Produtores', value: page.counters.producers },
      { label: 'Globais', value: page.counters.global },
      { label: 'Bloqueados', value: page.counters.blocked },
    ];
  }
  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }
  roleLabel(item: ProfessionalAdminItem): string {
    return item.role === 'VOICE_ACTOR' ? 'Locutor(a)' : 'Produtor(a)';
  }
  scopeLabel(item: ProfessionalAdminItem): string {
    return item.scope === 'GLOBAL' ? 'Global' : 'Revenda';
  }
  private persistAndLoad(): void {
    const f = this.filters();
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: f.query || null,
        role: f.role || null,
        scope: f.scope || null,
        status: f.accountStatus || null,
        sort: f.sort === 'name' ? null : f.sort,
        page: f.page === 1 ? null : f.page,
      },
      replaceUrl: true,
    });
    this.load();
  }
  private readFilters(): ProfessionalAdminFilters {
    const q = this.route.snapshot.queryParamMap;
    return {
      ...DEFAULT_FILTERS,
      query: q.get('q') ?? '',
      role: (q.get('role') as ProfessionalAdminFilters['role']) ?? '',
      scope: (q.get('scope') as ProfessionalAdminFilters['scope']) ?? '',
      accountStatus: (q.get('status') as ProfessionalAdminFilters['accountStatus']) ?? '',
      sort: (q.get('sort') as ProfessionalAdminFilters['sort']) ?? 'name',
      page: Number(q.get('page')) || 1,
    };
  }
}

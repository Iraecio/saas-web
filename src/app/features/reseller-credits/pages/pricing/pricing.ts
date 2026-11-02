import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, forkJoin } from 'rxjs';
import {
  CreditPackage,
  PackageQuery,
  PricingHistoryEvent,
  PricingOverview,
  PricingPreview,
} from '../../../../core/models/reseller-credit.model';
import { ResellerCreditService } from '../../services/reseller-credit';
import {
  DEFAULT_PACKAGE_QUERY,
  ResellerPricingQueryService,
} from '../../services/reseller-pricing-query';
import {
  formatMoneyInput,
  marginFor,
  parseMoneyToCents,
} from '../../services/reseller-pricing.presentation';

@Component({
  selector: 'app-reseller-pricing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe, DatePipe],
  styles: [
    `
      :host {
        display: block;
      }
      .panel {
        border: 1px solid rgb(226 232 240);
        border-radius: 1rem;
        background: rgb(255 255 255);
      }
      .field {
        width: 100%;
        border: 1px solid rgb(203 213 225);
        border-radius: 0.7rem;
        padding: 0.7rem 0.85rem;
        background: transparent;
      }
      .field:focus {
        outline: 2px solid rgb(14 116 144);
        outline-offset: 2px;
      }
      .button {
        min-height: 44px;
        border-radius: 0.7rem;
        padding: 0.65rem 1rem;
        font-weight: 700;
      }
      .primary {
        background: rgb(8 145 178);
        color: white;
      }
      .secondary {
        border: 1px solid rgb(203 213 225);
      }
      @media (prefers-color-scheme: dark) {
        .panel {
          border-color: rgb(51 65 85);
          background: rgb(15 23 42);
        }
        .field {
          border-color: rgb(71 85 105);
        }
      }
      @media (prefers-reduced-motion: reduce) {
        * {
          scroll-behavior: auto !important;
          transition: none !important;
        }
      }
    `,
  ],
  template: `
    <main class="mx-auto max-w-7xl space-y-6 p-4 sm:p-6" aria-busy="{{ loading() }}">
      <header class="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p
            class="text-sm font-semibold uppercase tracking-widest text-cyan-700 dark:text-cyan-300"
          >
            Operação comercial
          </p>
          <h1 class="text-3xl font-black tracking-tight">Preços e pacotes</h1>
          <p class="mt-1 text-slate-600 dark:text-slate-300">
            Defina sua margem e organize ofertas para vendas futuras.
          </p>
        </div>
        <button class="button secondary" type="button" (click)="reload()" [disabled]="loading()">
          {{ loading() ? 'Atualizando…' : 'Atualizar dados' }}
        </button>
      </header>

      @if (!online()) {
        <div role="alert" class="rounded-xl border border-amber-400 bg-amber-50 p-4 text-amber-900">
          Você está sem conexão. Seu rascunho foi preservado; alterações estão bloqueadas.
        </div>
      }
      @if (message()) {
        <div
          aria-live="polite"
          class="rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-900"
        >
          {{ message() }}
        </div>
      }
      @if (error()) {
        <div role="alert" class="rounded-xl border border-red-300 bg-red-50 p-4 text-red-900">
          <b>Não foi possível concluir.</b> {{ error() }}
          <button class="ml-2 underline" (click)="reload()">Tentar novamente</button>
        </div>
      }

      @if (loading() && !overview()) {
        <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Carregando resumo">
          @for (_ of [1, 2, 3, 4]; track _) {
            <div class="panel h-28 animate-pulse bg-slate-100 dark:bg-slate-800"></div>
          }
        </section>
      } @else if (overview(); as data) {
        <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo financeiro">
          <article class="panel p-4">
            <p class="text-sm text-slate-500">Custo por crédito</p>
            <strong class="mt-2 block text-xl">{{
              data.platformCost.unitPriceCents / 100 | currency: 'BRL'
            }}</strong
            ><small>Plataforma</small>
          </article>
          <article class="panel p-4">
            <p class="text-sm text-slate-500">Preço ao cliente</p>
            <strong class="mt-2 block text-xl">{{
              (data.config?.unitPriceCents ?? 0) / 100 | currency: 'BRL'
            }}</strong
            ><small>Vendas futuras</small>
          </article>
          <article class="panel p-4">
            <p class="text-sm text-slate-500">Margem unitária</p>
            <strong
              class="mt-2 block text-xl"
              [class.text-red-600]="(data.margin?.unitCents ?? 0) < 0"
              >{{ (data.margin?.unitCents ?? 0) / 100 | currency: 'BRL' }}</strong
            ><small>{{ data.margin?.percent ?? 0 | number: '1.0-2' }}% sobre o custo</small>
          </article>
          <article class="panel p-4">
            <p class="text-sm text-slate-500">Canal e pacotes</p>
            <strong class="mt-2 block text-xl">{{
              data.config?.allowDirectPurchase ? 'Ativo' : 'Suspenso'
            }}</strong
            ><small>{{ data.activePackageCount }} pacotes ativos</small>
          </article>
        </section>
      }

      <section class="grid gap-6 lg:grid-cols-[1.15fr_.85fr]">
        <form class="panel space-y-5 p-5" [formGroup]="pricingForm" (ngSubmit)="requestPreview()">
          <div>
            <h2 class="text-xl font-bold">Preço unitário</h2>
            <p class="text-sm text-slate-500">O novo valor não altera vendas já realizadas.</p>
          </div>
          <label class="block"
            ><span class="mb-1 block font-semibold">Preço ao cliente (R$)</span
            ><input
              class="field"
              formControlName="price"
              inputmode="decimal"
              placeholder="0,00"
              aria-describedby="price-help price-error"
            /><small id="price-help">Mínimo: custo vigente da plataforma.</small></label
          >
          @if (pricingForm.controls.price.touched && pricingForm.controls.price.invalid) {
            <p id="price-error" class="text-sm text-red-600">
              Informe um valor válido maior que zero.
            </p>
          }
          <label
            class="flex min-h-12 items-start gap-3 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
            ><input
              class="mt-1 size-5"
              type="checkbox"
              formControlName="allowDirectPurchase"
            /><span
              ><b>Permitir compra direta</b
              ><small class="block text-slate-500"
                >Quando suspenso, novas compras diretas ficam indisponíveis.</small
              ></span
            ></label
          >
          <div class="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
            <p class="text-sm">Prévia local</p>
            <p class="mt-1 font-bold">
              Margem: {{ draftMargin().cents / 100 | currency: 'BRL' }} ·
              {{ draftMargin().percent ?? 0 | number: '1.0-2' }}%
            </p>
          </div>
          <button
            class="button primary w-full sm:w-auto"
            [disabled]="pricingForm.invalid || saving() || !online()"
          >
            {{ saving() ? 'Preparando…' : 'Revisar alteração' }}
          </button>
        </form>

        <section class="panel p-5">
          <h2 class="text-xl font-bold">Como funciona</h2>
          <ol class="mt-4 space-y-4 text-sm">
            <li>
              <b>1. Confira o custo.</b><br />Ele é definido pela plataforma e serve como limite
              mínimo.
            </li>
            <li>
              <b>2. Revise a margem.</b><br />A prévia do servidor recalcula tudo com o custo
              vigente.
            </li>
            <li>
              <b>3. Confirme conscientemente.</b><br />A mudança vale apenas para novas vendas.
            </li>
          </ol>
        </section>
      </section>

      <section class="panel overflow-hidden">
        <div class="border-b border-slate-200 p-5 dark:border-slate-700">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold">Pacotes de créditos</h2>
              <p class="text-sm text-slate-500">Ofertas com preço total próprio.</p>
            </div>
            <button
              class="button primary"
              type="button"
              (click)="packageEditor.set(!packageEditor())"
            >
              {{ packageEditor() ? 'Fechar' : 'Novo pacote' }}
            </button>
          </div>
          @if (packageEditor()) {
            <form
              class="mt-5 grid gap-3 sm:grid-cols-4"
              [formGroup]="packageForm"
              (ngSubmit)="createPackage()"
            >
              <label
                >Nome<input
                  class="field"
                  formControlName="name"
                  placeholder="Ex.: Essencial" /></label
              ><label
                >Créditos<input
                  class="field"
                  type="number"
                  formControlName="credits"
                  min="1" /></label
              ><label
                >Preço total (R$)<input
                  class="field"
                  formControlName="price"
                  inputmode="decimal"
                  placeholder="0,00" /></label
              ><button class="button primary self-end" [disabled]="packageForm.invalid || saving()">
                Criar pacote
              </button>
            </form>
          }
          <form
            class="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_auto]"
            [formGroup]="filterForm"
            (ngSubmit)="applyFilters()"
          >
            <label
              ><span class="sr-only">Buscar pacotes</span
              ><input
                class="field"
                formControlName="q"
                placeholder="Buscar por nome ou quantidade" /></label
            ><label
              ><span class="sr-only">Status</span
              ><select class="field" formControlName="status">
                <option value="all">Todos</option>
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
              </select></label
            ><button class="button secondary">Aplicar filtros</button>
          </form>
        </div>

        @if (!packages().length && !loading()) {
          <div class="p-10 text-center">
            <h3 class="font-bold">Nenhum pacote encontrado</h3>
            <p class="text-slate-500">Crie o primeiro pacote ou limpe os filtros.</p>
          </div>
        }
        @if (selected().length) {
          <div
            class="flex flex-wrap items-center gap-3 border-b border-slate-200 bg-cyan-50 p-4 text-cyan-950 dark:border-slate-700 dark:bg-cyan-950 dark:text-cyan-50"
          >
            <b>{{ selected().length }} selecionado(s)</b
            ><button class="button secondary" (click)="bulkAction('ACTIVATE')">
              Ativar em lote</button
            ><button class="button secondary" (click)="bulkAction('DEACTIVATE')">
              Desativar em lote</button
            ><button class="ml-auto underline" (click)="selected.set([])">Limpar</button>
          </div>
        }
        <div class="hidden overflow-x-auto md:block">
          <table class="w-full text-left">
            <thead class="bg-slate-50 text-sm dark:bg-slate-800">
              <tr>
                <th class="p-4"><span class="sr-only">Selecionar</span></th>
                <th class="p-4">Pacote</th>
                <th class="p-4">Créditos</th>
                <th class="p-4">Preço total</th>
                <th class="p-4">Por crédito</th>
                <th class="p-4">Margem estimada</th>
                <th class="p-4">Status</th>
                <th class="p-4"><span class="sr-only">Ações</span></th>
              </tr>
            </thead>
            <tbody>
              @for (p of packages(); track p.id) {
                <tr class="border-t border-slate-200 dark:border-slate-700">
                  <td class="p-4">
                    <input
                      type="checkbox"
                      [checked]="selected().includes(p.id)"
                      (change)="selectPackage(p.id)"
                      [attr.aria-label]="'Selecionar ' + (p.name || 'pacote ' + p.creditAmount)"
                    />
                  </td>
                  <td class="p-4 font-semibold">{{ p.name || 'Pacote ' + p.creditAmount }}</td>
                  <td class="p-4">{{ p.creditAmount }}</td>
                  <td class="p-4">{{ p.priceCents / 100 | currency: 'BRL' }}</td>
                  <td class="p-4">{{ p.priceCents / p.creditAmount / 100 | currency: 'BRL' }}</td>
                  <td class="p-4">{{ packageMargin(p) / 100 | currency: 'BRL' }}</td>
                  <td class="p-4">{{ p.isActive ? 'Ativo' : 'Inativo' }}</td>
                  <td class="p-4">
                    <button class="button secondary" (click)="togglePackage(p)">
                      {{ p.isActive ? 'Desativar' : 'Ativar' }}
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="grid gap-3 p-4 md:hidden">
          @for (p of packages(); track p.id) {
            <article class="rounded-xl border border-slate-200 p-4 dark:border-slate-700">
              <div class="flex justify-between gap-3">
                <div>
                  <h3 class="font-bold">{{ p.name || 'Pacote ' + p.creditAmount }}</h3>
                  <p class="text-sm">{{ p.creditAmount }} créditos</p>
                </div>
                <span>{{ p.isActive ? 'Ativo' : 'Inativo' }}</span>
              </div>
              <p class="mt-4 text-xl font-black">{{ p.priceCents / 100 | currency: 'BRL' }}</p>
              <p class="text-sm text-slate-500">
                Margem estimada {{ packageMargin(p) / 100 | currency: 'BRL' }}
              </p>
              <button class="button secondary mt-4 w-full" (click)="togglePackage(p)">
                {{ p.isActive ? 'Desativar' : 'Ativar' }}
              </button>
            </article>
          }
        </div>
        @if (packageMeta().totalPages > 1) {
          <footer
            class="flex items-center justify-between border-t border-slate-200 p-4 dark:border-slate-700"
          >
            <button
              class="button secondary"
              [disabled]="query().page <= 1"
              (click)="changePage(-1)"
            >
              Anterior</button
            ><span>Página {{ query().page }} de {{ packageMeta().totalPages }}</span
            ><button
              class="button secondary"
              [disabled]="query().page >= packageMeta().totalPages"
              (click)="changePage(1)"
            >
              Próxima
            </button>
          </footer>
        }
      </section>

      <section class="panel p-5">
        <h2 class="text-xl font-bold">Histórico recente</h2>
        @if (!history().length) {
          <p class="mt-4 text-slate-500">As alterações confirmadas aparecerão aqui.</p>
        } @else {
          <ul class="mt-4 divide-y divide-slate-200 dark:divide-slate-700">
            @for (event of history(); track event.id) {
              <li class="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:justify-between">
                <span
                  ><b>{{ event.action }}</b> · {{ event.targetType }}</span
                ><time>{{ event.createdAt | date: 'short' }}</time>
              </li>
            }
          </ul>
        }
      </section>
    </main>

    @if (preview(); as item) {
      <div
        class="fixed inset-0 z-50 grid place-items-center bg-slate-950/60 p-4"
        role="presentation"
        (click)="preview.set(null)"
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          class="panel w-full max-w-lg p-6 shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <h2 id="confirm-title" class="text-2xl font-black">Confirmar novo preço?</h2>
          <p class="mt-2 text-slate-500">A alteração afeta somente vendas futuras.</p>
          <dl class="mt-5 grid grid-cols-2 gap-4">
            <div>
              <dt class="text-sm text-slate-500">Preço anterior</dt>
              <dd class="font-bold">
                {{ (item.before?.unitPriceCents ?? 0) / 100 | currency: 'BRL' }}
              </dd>
            </div>
            <div>
              <dt class="text-sm text-slate-500">Novo preço</dt>
              <dd class="font-bold">{{ item.after.unitPriceCents / 100 | currency: 'BRL' }}</dd>
            </div>
            <div>
              <dt class="text-sm text-slate-500">Custo vigente</dt>
              <dd class="font-bold">{{ item.cost.unitPriceCents / 100 | currency: 'BRL' }}</dd>
            </div>
            <div>
              <dt class="text-sm text-slate-500">Nova margem</dt>
              <dd class="font-bold">{{ item.margin.unitCents / 100 | currency: 'BRL' }}</dd>
            </div>
          </dl>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button class="button secondary" (click)="preview.set(null)">Voltar e revisar</button
            ><button class="button primary" (click)="confirmPricing()" [disabled]="saving()">
              {{ saving() ? 'Salvando…' : 'Confirmar alteração' }}
            </button>
          </div>
        </section>
      </div>
    }
  `,
})
export class ResellerPricingPage {
  private readonly service = inject(ResellerCreditService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly queryService = inject(ResellerPricingQueryService);
  private readonly destroyRef = inject(DestroyRef);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly online = signal(typeof navigator === 'undefined' ? true : navigator.onLine);
  readonly error = signal('');
  readonly message = signal('');
  readonly overview = signal<PricingOverview | null>(null);
  readonly packages = signal<CreditPackage[]>([]);
  readonly history = signal<PricingHistoryEvent[]>([]);
  readonly preview = signal<PricingPreview | null>(null);
  readonly packageEditor = signal(false);
  readonly selected = signal<string[]>([]);
  readonly query = signal<PackageQuery>(DEFAULT_PACKAGE_QUERY);
  readonly packageMeta = signal({ total: 0, totalPages: 0 });
  readonly pricingForm = new FormGroup({
    price: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    allowDirectPurchase: new FormControl(false, { nonNullable: true }),
  });
  readonly filterForm = new FormGroup({
    q: new FormControl('', { nonNullable: true }),
    status: new FormControl<'all' | 'active' | 'inactive'>('all', { nonNullable: true }),
  });
  readonly packageForm = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    credits: new FormControl(10, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    price: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly priceDraft = signal('');
  readonly draftMargin = computed(() =>
    marginFor(
      parseMoneyToCents(this.priceDraft()),
      this.overview()?.platformCost.unitPriceCents ?? 0,
    ),
  );

  constructor() {
    this.query.set(this.queryService.fromParams(this.route.snapshot.queryParams));
    this.filterForm.patchValue({ q: this.query().q, status: this.query().status });
    this.pricingForm.controls.price.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => this.priceDraft.set(value));
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.online.set(true));
      window.addEventListener('offline', () => this.online.set(false));
    }
    this.reload();
  }
  reload() {
    this.loading.set(true);
    this.error.set('');
    forkJoin({
      overview: this.service.getPricingOverview(),
      packages: this.service.listPackages(this.query()),
      history: this.service.listPricingHistory(),
    })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: ({ overview, packages, history }) => {
          this.overview.set(overview);
          this.packages.set(packages.items);
          this.packageMeta.set({
            total: packages.meta.total,
            totalPages: packages.meta.totalPages,
          });
          this.history.set(history.items);
          if (!this.pricingForm.dirty)
            this.pricingForm.patchValue({
              price: formatMoneyInput(overview.config?.unitPriceCents ?? 0),
              allowDirectPurchase: overview.config?.allowDirectPurchase ?? false,
            });
        },
        error: (error) => this.error.set(error.message),
      });
  }
  requestPreview() {
    this.pricingForm.markAllAsTouched();
    if (this.pricingForm.invalid) return;
    this.saving.set(true);
    this.error.set('');
    this.service
      .previewPricing({
        unitPriceCents: parseMoneyToCents(this.pricingForm.controls.price.value),
        allowDirectPurchase: this.pricingForm.controls.allowDirectPurchase.value,
        expectedVersion: this.overview()?.config?.version ?? 0,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (value) => this.preview.set(value),
        error: (error) => this.error.set(error.message),
      });
  }
  confirmPricing() {
    const preview = this.preview();
    if (!preview) return;
    this.saving.set(true);
    this.service
      .confirmPricing(preview.previewId)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.preview.set(null);
          this.pricingForm.markAsPristine();
          this.message.set('Preço e disponibilidade atualizados com sucesso.');
          this.reload();
        },
        error: (error) => {
          this.preview.set(null);
          this.error.set(error.message);
          this.reload();
        },
      });
  }
  createPackage() {
    if (this.packageForm.invalid) return;
    this.saving.set(true);
    this.service
      .createPackage({
        name: this.packageForm.controls.name.value,
        creditAmount: this.packageForm.controls.credits.value,
        priceCents: parseMoneyToCents(this.packageForm.controls.price.value),
        expectedPricingVersion: this.overview()?.config?.version ?? 0,
      })
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.packageForm.reset({ name: '', credits: 10, price: '' });
          this.packageEditor.set(false);
          this.message.set('Pacote criado com sucesso.');
          this.reload();
        },
        error: (error) => this.error.set(error.message),
      });
  }
  togglePackage(pkg: CreditPackage) {
    if (!confirm(`${pkg.isActive ? 'Desativar' : 'Ativar'} este pacote para vendas futuras?`))
      return;
    this.saving.set(true);
    this.service
      .togglePackage(pkg.id, !pkg.isActive, pkg.version)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: () => {
          this.message.set('Status do pacote atualizado.');
          this.reload();
        },
        error: (error) => {
          this.error.set(error.message);
          this.reload();
        },
      });
  }
  selectPackage(id: string) {
    this.selected.update((ids) =>
      ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id],
    );
  }
  bulkAction(action: 'ACTIVATE' | 'DEACTIVATE') {
    const ids = this.selected();
    if (!ids.length) return;
    this.saving.set(true);
    this.service.previewPackageBulk(action, ids).subscribe({
      next: (preview) => {
        if (
          !preview.eligible.length ||
          !confirm(`${preview.eligible.length} pacote(s) elegível(is). Confirmar ação?`)
        ) {
          this.saving.set(false);
          return;
        }
        this.service
          .executePackageBulk(preview.previewId)
          .pipe(finalize(() => this.saving.set(false)))
          .subscribe({
            next: (result) => {
              this.selected.set([]);
              this.message.set(
                `${result.results.filter((item) => item.success).length} pacote(s) atualizado(s).`,
              );
              this.reload();
            },
            error: (error) => this.error.set(error.message),
          });
      },
      error: (error) => {
        this.saving.set(false);
        this.error.set(error.message);
      },
    });
  }
  applyFilters() {
    this.query.update((query) => ({ ...query, ...this.filterForm.getRawValue(), page: 1 }));
    this.syncQuery();
  }
  changePage(delta: number) {
    this.query.update((query) => ({ ...query, page: query.page + delta }));
    this.syncQuery();
  }
  private syncQuery() {
    this.router
      .navigate([], {
        relativeTo: this.route,
        queryParams: this.queryService.toParams(this.query()),
      })
      .then(() => this.reload());
  }
  packageMargin(pkg: CreditPackage) {
    return pkg.priceCents - (this.overview()?.platformCost.unitPriceCents ?? 0) * pkg.creditAmount;
  }
}

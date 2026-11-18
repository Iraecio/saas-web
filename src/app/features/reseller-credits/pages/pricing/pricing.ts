import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  HostListener,
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

interface PendingConfirmation {
  title: string;
  description: string;
  confirmLabel: string;
  tone: 'default' | 'danger';
  action: () => void;
}

@Component({
  selector: 'app-reseller-pricing',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe, DatePipe],
  styles: [
    `
      :host {
        display: block;
        color: rgb(23 23 23);
        --surface: rgb(255 255 255);
        --surface-subtle: rgb(250 250 250);
        --border: rgb(229 229 229);
        --muted: rgb(82 82 82);
        --accent: rgb(23 23 23);
      }
      .panel {
        border: 1px solid var(--border);
        border-radius: 1.25rem;
        background: var(--surface);
        box-shadow:
          0 1px 2px rgb(23 23 23 / 0.03),
          0 12px 32px rgb(23 23 23 / 0.035);
      }
      .metric-card {
        position: relative;
        min-height: 9.5rem;
        overflow: visible;
        padding: 1.15rem;
      }
      .metric-card::after {
        position: absolute;
        right: 0.75rem;
        bottom: 0.75rem;
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 999px;
        background: rgb(163 163 163 / 0.1);
        content: '';
        pointer-events: none;
      }
      .metric-value {
        font-variant-numeric: tabular-nums;
        letter-spacing: -0.04em;
      }
      .field {
        width: 100%;
        min-height: 2.875rem;
        border: 1px solid var(--border);
        border-radius: 0.75rem;
        padding: 0.7rem 0.85rem;
        background: var(--surface);
        transition:
          border-color 180ms ease,
          box-shadow 180ms ease,
          background 180ms ease;
      }
      .field:focus {
        border-color: var(--accent);
        outline: none;
        box-shadow: 0 0 0 3px rgb(115 115 115 / 0.18);
      }
      .button {
        min-height: 44px;
        border-radius: 0.75rem;
        padding: 0.65rem 1rem;
        font-weight: 650;
        transition:
          transform 180ms ease,
          background 180ms ease,
          border-color 180ms ease,
          opacity 180ms ease;
      }
      .button:hover:not(:disabled) {
        transform: translateY(-1px);
      }
      .button:active:not(:disabled) {
        transform: translateY(0) scale(0.98);
      }
      .button:focus-visible,
      .icon-button:focus-visible {
        outline: 2px solid var(--accent);
        outline-offset: 3px;
      }
      .button:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }
      .primary {
        background: var(--accent);
        color: white;
      }
      .primary:hover:not(:disabled) {
        background: rgb(38 38 38);
      }
      .secondary {
        border: 1px solid var(--border);
        background: var(--surface);
      }
      .secondary:hover:not(:disabled) {
        background: var(--surface-subtle);
        border-color: rgb(163 163 163);
      }
      .icon-button {
        display: inline-grid;
        width: 1.35rem;
        height: 1.35rem;
        place-items: center;
        border-radius: 999px;
        background: rgb(229 229 229);
        color: rgb(82 82 82);
        font-size: 0.75rem;
        font-weight: 800;
      }
      .tooltip {
        position: relative;
      }
      .tooltip::after {
        position: absolute;
        z-index: 20;
        bottom: calc(100% + 0.5rem);
        left: 50%;
        width: max-content;
        max-width: 15rem;
        padding: 0.5rem 0.65rem;
        transform: translate(-50%, 0.25rem);
        border-radius: 0.5rem;
        background: rgb(23 23 23);
        color: white;
        content: attr(data-tooltip);
        font-size: 0.75rem;
        font-weight: 500;
        line-height: 1.35;
        opacity: 0;
        pointer-events: none;
        transition:
          opacity 160ms ease,
          transform 160ms ease;
      }
      .tooltip:hover::after,
      .tooltip:focus-visible::after {
        transform: translate(-50%, 0);
        opacity: 1;
      }
      .status-dot {
        width: 0.45rem;
        height: 0.45rem;
        border-radius: 999px;
        background: currentColor;
      }
      .notice {
        border: 1px solid var(--border);
        border-left-width: 3px;
        border-radius: 0.85rem;
        background: var(--surface);
      }
      .dialog-backdrop {
        animation: fade-in 160ms ease-out;
        backdrop-filter: blur(4px);
      }
      .dialog-panel {
        animation: dialog-in 220ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }
      @keyframes fade-in {
        from {
          opacity: 0;
        }
      }
      @keyframes dialog-in {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.985);
        }
      }
      @media (prefers-color-scheme: dark) {
        :host:not-context(.light) {
        }
      }
      :host-context(.dark) {
        color: rgb(245 245 245);
        --surface: rgb(23 23 23);
        --surface-subtle: rgb(38 38 38);
        --border: rgb(64 64 64);
        --muted: rgb(163 163 163);
        --accent: rgb(250 250 250);
      }
      :host-context(.dark) .primary {
        color: rgb(23 23 23);
      }
      :host-context(.dark) .primary:hover:not(:disabled) {
        background: rgb(229 229 229);
      }
      :host-context(.dark) .icon-button {
        background: rgb(64 64 64);
        color: rgb(212 212 212);
      }
      :host-context(.dark) .tooltip::after {
        background: rgb(245 245 245);
        color: rgb(23 23 23);
      }
      @media (max-width: 639px) {
        .metric-card {
          min-height: 8.5rem;
          padding: 1rem;
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
    <main
      class="mx-auto max-w-[90rem] space-y-6 px-4 py-5 sm:px-6 sm:py-8"
      [attr.aria-busy]="loading()"
    >
      <header
        class="flex flex-col gap-5 border-b border-neutral-200 pb-6 dark:border-neutral-800 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Créditos de revenda
          </p>
          <h1 class="mt-1 text-3xl font-black tracking-[-0.045em] text-balance sm:text-4xl">
            Preços e pacotes
          </h1>
          <p
            class="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base"
          >
            Controle seu preço por crédito, margem e ofertas disponíveis para novas vendas.
          </p>
        </div>
        <button
          class="button secondary inline-flex items-center justify-center gap-2"
          type="button"
          (click)="reload()"
          [disabled]="loading()"
        >
          <span aria-hidden="true" [class.animate-spin]="loading()">↻</span>
          {{ loading() ? 'Atualizando dados…' : 'Atualizar dados' }}
        </button>
      </header>

      @if (!online()) {
        <div
          role="alert"
          class="notice border-l-amber-500 p-4 text-sm text-neutral-800 dark:text-neutral-200"
        >
          <b>Você está offline.</b> O rascunho continua nesta página, mas as alterações ficam
          bloqueadas até a conexão voltar.
        </div>
      }
      @if (message()) {
        <div
          aria-live="polite"
          class="notice border-l-emerald-600 p-4 text-sm text-neutral-800 dark:border-l-emerald-400 dark:text-neutral-200"
        >
          {{ message() }}
        </div>
      }
      @if (error()) {
        <div
          role="alert"
          class="notice border-l-red-600 p-4 text-sm text-neutral-800 dark:border-l-red-400 dark:text-neutral-200"
        >
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
          <article class="panel metric-card">
            <div class="flex items-center gap-2">
              <p class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 sm:text-sm">
                Custo por crédito
              </p>
              <button
                type="button"
                class="icon-button tooltip"
                data-tooltip="Valor cobrado pela plataforma por cada crédito."
                aria-label="Sobre o custo por crédito"
              >
                ?
              </button>
            </div>
            <strong class="metric-value mt-5 block text-xl sm:text-2xl">{{
              data.platformCost.unitPriceCents / 100 | currency: 'BRL'
            }}</strong
            ><small class="text-neutral-500 dark:text-neutral-400">Definido pela plataforma</small>
          </article>
          <article class="panel metric-card">
            <p class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 sm:text-sm">
              Preço ao cliente
            </p>
            <strong class="metric-value mt-5 block text-xl sm:text-2xl">{{
              (data.config?.unitPriceCents ?? 0) / 100 | currency: 'BRL'
            }}</strong
            ><small class="text-neutral-500 dark:text-neutral-400"
              >Aplicado às próximas vendas</small
            >
          </article>
          <article class="panel metric-card">
            <div class="flex items-center gap-2">
              <p class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 sm:text-sm">
                Margem unitária
              </p>
              <button
                type="button"
                class="icon-button tooltip"
                data-tooltip="Diferença entre seu preço de venda e o custo da plataforma."
                aria-label="Como a margem é calculada"
              >
                ?
              </button>
            </div>
            <strong
              class="metric-value mt-5 block text-xl sm:text-2xl"
              [class.text-red-600]="(data.margin?.unitCents ?? 0) < 0"
              >{{ (data.margin?.unitCents ?? 0) / 100 | currency: 'BRL' }}</strong
            ><small class="text-neutral-500 dark:text-neutral-400"
              >{{ data.margin?.percent ?? 0 | number: '1.0-2' }}% sobre o custo</small
            >
          </article>
          <article class="panel metric-card">
            <p class="text-xs font-semibold text-neutral-500 dark:text-neutral-400 sm:text-sm">
              Canal de venda
            </p>
            <strong class="mt-5 flex items-center gap-2 text-xl"
              ><span
                class="status-dot"
                [class.text-emerald-600]="data.config?.allowDirectPurchase"
                [class.text-neutral-400]="!data.config?.allowDirectPurchase"
              ></span
              >{{ data.config?.allowDirectPurchase ? 'Ativo' : 'Suspenso' }}</strong
            ><small class="text-neutral-500 dark:text-neutral-400"
              >{{ data.activePackageCount }} pacotes ativos</small
            >
          </article>
        </section>
      }

      <section class="grid items-start gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(18rem,.75fr)]">
        <form
          class="panel space-y-5 p-5 sm:p-6"
          [formGroup]="pricingForm"
          (ngSubmit)="requestPreview()"
        >
          <div>
            <h2 class="text-xl font-bold">Preço unitário</h2>
            <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
              O novo valor não altera vendas já realizadas.
            </p>
          </div>
          <label class="block"
            ><span class="mb-1 block font-semibold">Preço ao cliente (R$)</span
            ><input
              class="field"
              formControlName="price"
              inputmode="decimal"
              placeholder="0,00"
              aria-describedby="price-help price-error"
            /><small id="price-help" class="mt-1.5 block text-neutral-500 dark:text-neutral-400"
              >Mínimo recomendado: custo vigente de
              {{ (overview()?.platformCost?.unitPriceCents ?? 0) / 100 | currency: 'BRL' }}.</small
            ></label
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
              ><small class="block text-neutral-500 dark:text-neutral-400"
                >Quando suspenso, novas compras diretas ficam indisponíveis.</small
              ></span
            ></label
          >
          <div class="rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
            <div class="flex items-center gap-2">
              <p class="text-sm font-medium">Estimativa imediata</p>
              <button
                type="button"
                class="icon-button tooltip"
                data-tooltip="A confirmação usa uma nova validação do servidor com o custo mais recente."
                aria-label="Sobre esta estimativa"
              >
                ?
              </button>
            </div>
            <p class="metric-value mt-2 text-lg font-bold">
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

        <aside class="panel p-5 sm:p-6 lg:sticky lg:top-6">
          <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Antes de publicar
          </p>
          <h2 class="mt-1 text-xl font-bold tracking-tight">Uma mudança segura em 3 passos</h2>
          <ol class="mt-5 space-y-5 text-sm">
            <li class="grid grid-cols-[2rem_1fr] gap-3">
              <span
                class="grid size-8 place-items-center rounded-lg bg-neutral-900 text-xs font-bold text-white dark:bg-white dark:text-neutral-900"
                >1</span
              ><span
                ><b>Confira o custo</b><br /><span class="text-neutral-500 dark:text-neutral-400"
                  >Ele define o limite para proteger sua margem.</span
                ></span
              >
            </li>
            <li class="grid grid-cols-[2rem_1fr] gap-3">
              <span
                class="grid size-8 place-items-center rounded-lg bg-neutral-200 text-xs font-bold dark:bg-neutral-700"
                >2</span
              ><span
                ><b>Revise a prévia</b><br /><span class="text-neutral-500 dark:text-neutral-400"
                  >O servidor recalcula tudo com os dados mais recentes.</span
                ></span
              >
            </li>
            <li class="grid grid-cols-[2rem_1fr] gap-3">
              <span
                class="grid size-8 place-items-center rounded-lg bg-neutral-200 text-xs font-bold dark:bg-neutral-700"
                >3</span
              ><span
                ><b>Confirme a publicação</b><br /><span
                  class="text-neutral-500 dark:text-neutral-400"
                  >Somente novas vendas recebem o novo preço.</span
                ></span
              >
            </li>
          </ol>
        </aside>
      </section>

      <section class="panel overflow-hidden">
        <div class="border-b border-neutral-200 p-5 dark:border-neutral-700 sm:p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 class="text-xl font-bold">Pacotes de créditos</h2>
              <p class="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                Ofertas com preço total próprio.
              </p>
            </div>
            <button
              class="button primary inline-flex items-center gap-2"
              type="button"
              (click)="packageEditor.set(!packageEditor())"
              [attr.aria-expanded]="packageEditor()"
            >
              <span aria-hidden="true">{{ packageEditor() ? '×' : '+' }}</span
              >{{ packageEditor() ? 'Fechar criação' : 'Novo pacote' }}
            </button>
          </div>
          @if (packageEditor()) {
            <form
              class="mt-5 grid gap-4 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800 sm:grid-cols-2 lg:grid-cols-4"
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
            <p class="mt-1 text-neutral-500 dark:text-neutral-400">
              Crie o primeiro pacote ou ajuste os filtros.
            </p>
          </div>
        }
        @if (selected().length) {
          <div
            class="flex flex-wrap items-center gap-3 border-b border-neutral-200 bg-neutral-100 p-4 text-neutral-900 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
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
                <tr
                  class="border-t border-neutral-200 transition-colors hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/60"
                >
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
                  <td class="p-4">
                    <span class="inline-flex items-center gap-2 text-sm font-medium"
                      ><span
                        class="status-dot"
                        [class.text-emerald-600]="p.isActive"
                        [class.text-neutral-400]="!p.isActive"
                      ></span
                      >{{ p.isActive ? 'Ativo' : 'Inativo' }}</span
                    >
                  </td>
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
            <article
              class="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-700 dark:bg-neutral-800/50"
            >
              <div class="flex justify-between gap-3">
                <div>
                  <h3 class="font-bold">{{ p.name || 'Pacote ' + p.creditAmount }}</h3>
                  <p class="text-sm">{{ p.creditAmount }} créditos</p>
                </div>
                <span class="inline-flex items-center gap-2 text-sm font-medium"
                  ><span
                    class="status-dot"
                    [class.text-emerald-600]="p.isActive"
                    [class.text-neutral-400]="!p.isActive"
                  ></span
                  >{{ p.isActive ? 'Ativo' : 'Inativo' }}</span
                >
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
        class="dialog-backdrop fixed inset-0 z-50 grid place-items-center bg-neutral-950/60 p-4"
        role="presentation"
        (click)="preview.set(null)"
      >
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          class="panel dialog-panel w-full max-w-lg p-6 shadow-2xl"
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

    @if (pendingConfirmation(); as confirmation) {
      <div
        class="dialog-backdrop fixed inset-0 z-50 grid place-items-center bg-neutral-950/60 p-4"
        role="presentation"
        (click)="closeConfirmation()"
      >
        <section
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="action-dialog-title"
          aria-describedby="action-dialog-description"
          class="panel dialog-panel w-full max-w-md p-6 shadow-2xl"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                Confirme a ação
              </p>
              <h2 id="action-dialog-title" class="mt-1 text-2xl font-black tracking-tight">
                {{ confirmation.title }}
              </h2>
            </div>
            <button
              type="button"
              class="icon-button"
              aria-label="Fechar confirmação"
              (click)="closeConfirmation()"
            >
              ×
            </button>
          </div>
          <p
            id="action-dialog-description"
            class="mt-4 text-sm leading-6 text-neutral-600 dark:text-neutral-300"
          >
            {{ confirmation.description }}
          </p>
          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button type="button" class="button secondary" (click)="closeConfirmation()">
              Cancelar
            </button>
            <button
              type="button"
              class="button"
              [class.primary]="confirmation.tone === 'default'"
              [class.bg-red-600]="confirmation.tone === 'danger'"
              [class.text-white]="confirmation.tone === 'danger'"
              (click)="confirmPendingAction()"
              [disabled]="saving()"
              autofocus
            >
              {{ saving() ? 'Processando…' : confirmation.confirmLabel }}
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
  readonly pendingConfirmation = signal<PendingConfirmation | null>(null);
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
    this.reload();
  }
  @HostListener('window:online')
  handleOnline() {
    this.online.set(true);
  }
  @HostListener('window:offline')
  handleOffline() {
    this.online.set(false);
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
    const packageName = pkg.name || `Pacote ${pkg.creditAmount}`;
    this.pendingConfirmation.set({
      title: `${pkg.isActive ? 'Desativar' : 'Ativar'} ${packageName}?`,
      description: pkg.isActive
        ? 'O pacote deixará de aparecer para novas compras. Vendas já concluídas não serão alteradas.'
        : 'O pacote ficará disponível imediatamente para novas compras com o preço configurado.',
      confirmLabel: pkg.isActive ? 'Desativar pacote' : 'Ativar pacote',
      tone: pkg.isActive ? 'danger' : 'default',
      action: () => this.executePackageToggle(pkg),
    });
  }
  private executePackageToggle(pkg: CreditPackage) {
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
        if (!preview.eligible.length) {
          this.saving.set(false);
          this.error.set('Nenhum dos pacotes selecionados pode receber esta alteração.');
          return;
        }
        this.saving.set(false);
        this.pendingConfirmation.set({
          title:
            action === 'ACTIVATE'
              ? 'Ativar pacotes selecionados?'
              : 'Desativar pacotes selecionados?',
          description: `${preview.eligible.length} pacote(s) estão elegíveis. ${preview.ineligible.length ? `${preview.ineligible.length} não serão alterados.` : 'Todos os itens selecionados serão alterados.'}`,
          confirmLabel: action === 'ACTIVATE' ? 'Ativar pacotes' : 'Desativar pacotes',
          tone: action === 'ACTIVATE' ? 'default' : 'danger',
          action: () => this.executeBulkPreview(preview.previewId),
        });
      },
      error: (error) => {
        this.saving.set(false);
        this.error.set(error.message);
      },
    });
  }
  private executeBulkPreview(previewId: string) {
    this.saving.set(true);
    this.service
      .executePackageBulk(previewId)
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
  }
  confirmPendingAction() {
    const confirmation = this.pendingConfirmation();
    if (!confirmation || this.saving()) return;
    this.pendingConfirmation.set(null);
    confirmation.action();
  }
  closeConfirmation() {
    if (!this.saving()) this.pendingConfirmation.set(null);
  }
  @HostListener('document:keydown.escape')
  closeDialogs() {
    this.preview.set(null);
    this.closeConfirmation();
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

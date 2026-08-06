import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { PlatformCreditPrice } from '../../../../core/models/credit-price.model';
import { CreditPriceSettingsService } from '../../services/credit-price-settings';

@Component({
  selector: 'app-credit-price-settings',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule],
  template: `
    <main class="space-y-6 p-6">
      <header>
        <h2 class="text-2xl font-bold text-neutral-900 dark:text-white">Valor dos créditos</h2>
        <p class="mt-1 text-sm text-neutral-500">
          Defina quanto cada crédito custará para os revendedores. Novos valores não alteram compras
          anteriores.
        </p>
      </header>

      @if (error()) {
        <div
          class="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          role="alert"
        >
          <span>{{ error() }}</span>
          <button type="button" class="btn-secondary" [disabled]="loading()" (click)="load()">
            Tentar novamente
          </button>
        </div>
      }

      @if (success()) {
        <p
          class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
          role="status"
        >
          {{ success() }}
        </p>
      }

      <section class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]">
        <div
          class="rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
        >
          <p class="text-sm font-medium text-neutral-500">Preço vigente por crédito</p>
          @if (loading() && !current()) {
            <div
              class="mt-3 h-10 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"
            ></div>
          } @else if (current(); as price) {
            <p class="mt-2 text-4xl font-bold text-neutral-900 dark:text-white">
              {{ price.unitPriceCents / 100 | currency: 'BRL' }}
            </p>
            <p class="mt-2 text-sm text-neutral-500">
              Vigente desde {{ price.effectiveFrom | date: 'dd/MM/yyyy HH:mm' }}
            </p>
            @if (price.note) {
              <p class="mt-3 rounded-lg bg-neutral-50 p-3 text-sm dark:bg-neutral-800">
                {{ price.note }}
              </p>
            }
          } @else {
            <p class="mt-3 text-lg font-semibold text-amber-700 dark:text-amber-300">
              Nenhum preço vigente configurado
            </p>
            <p class="mt-1 text-sm text-neutral-500">
              Os revendedores não poderão comprar créditos até que um preço entre em vigor.
            </p>
          }
        </div>

        <form
          class="space-y-4 rounded-xl border border-neutral-200 bg-white p-5 dark:border-neutral-700 dark:bg-neutral-900"
          [formGroup]="form"
          (ngSubmit)="save()"
        >
          <div>
            <h3 class="font-semibold text-neutral-900 dark:text-white">Definir novo valor</h3>
            <p class="mt-1 text-xs text-neutral-500">
              O histórico é permanente. Para reajustar, crie uma nova vigência.
            </p>
          </div>

          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Valor de cada crédito (R$)
            <input
              class="form-input mt-1 w-full"
              type="number"
              min="0.01"
              step="0.01"
              inputmode="decimal"
              formControlName="unitPrice"
              placeholder="Ex.: 1,50"
            />
            @if (form.controls.unitPrice.touched && form.controls.unitPrice.invalid) {
              <span class="mt-1 block text-xs font-normal text-red-600">
                Informe um valor maior ou igual a R$ 0,01.
              </span>
            }
          </label>

          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Início da vigência (opcional)
            <input
              class="form-input mt-1 w-full"
              type="datetime-local"
              formControlName="effectiveFrom"
            />
            <span class="mt-1 block text-xs font-normal text-neutral-500">
              Deixe vazio para começar agora. A API não permite datas retroativas.
            </span>
          </label>

          <label class="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Motivo ou observação (opcional)
            <textarea
              class="form-input mt-1 min-h-20 w-full"
              formControlName="note"
              placeholder="Ex.: Reajuste da tabela comercial"
            ></textarea>
          </label>

          <button type="submit" class="btn-primary w-full" [disabled]="form.invalid || saving()">
            {{ saving() ? 'Salvando...' : 'Salvar novo valor' }}
          </button>
        </form>
      </section>

      <section
        class="overflow-hidden rounded-xl border border-neutral-200 bg-white dark:border-neutral-700 dark:bg-neutral-900"
      >
        <div class="border-b border-neutral-200 p-5 dark:border-neutral-700">
          <h3 class="font-semibold text-neutral-900 dark:text-white">Histórico de valores</h3>
          <p class="mt-1 text-sm text-neutral-500">{{ total() }} vigência(s) registrada(s).</p>
        </div>

        @if (!loading() && history().length === 0) {
          <p class="p-6 text-center text-sm text-neutral-500">Nenhum valor foi registrado ainda.</p>
        } @else {
          <div class="overflow-x-auto">
            <table class="w-full text-left text-sm">
              <thead class="bg-neutral-50 text-neutral-500 dark:bg-neutral-800/60">
                <tr>
                  <th class="px-5 py-3 font-medium">Valor por crédito</th>
                  <th class="px-5 py-3 font-medium">Início da vigência</th>
                  <th class="px-5 py-3 font-medium">Observação</th>
                  <th class="px-5 py-3 font-medium">Registrado em</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-neutral-200 dark:divide-neutral-700">
                @for (price of history(); track price.id) {
                  <tr>
                    <td class="px-5 py-4 font-semibold text-neutral-900 dark:text-white">
                      {{ price.unitPriceCents / 100 | currency: 'BRL' }}
                    </td>
                    <td class="whitespace-nowrap px-5 py-4">
                      {{ price.effectiveFrom | date: 'dd/MM/yyyy HH:mm' }}
                    </td>
                    <td class="max-w-md px-5 py-4 text-neutral-500">{{ price.note || '—' }}</td>
                    <td class="whitespace-nowrap px-5 py-4 text-neutral-500">
                      {{ price.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </section>
    </main>
  `,
})
export class CreditPriceSettingsPage {
  private readonly service = inject(CreditPriceSettingsService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly current = signal<PlatformCreditPrice | null>(null);
  readonly history = signal<PlatformCreditPrice[]>([]);
  readonly total = signal(0);

  readonly form = this.fb.nonNullable.group({
    unitPrice: [null as number | null, [Validators.required, Validators.min(0.01)]],
    effectiveFrom: [''],
    note: [''],
  });

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.service
      .getOverview()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (overview) => {
          this.current.set(overview.current ?? null);
          this.history.set(overview.history?.items ?? []);
          this.total.set(overview.history?.total ?? 0);
        },
        error: (error: Error) =>
          this.error.set(error.message || 'Não foi possível carregar os valores dos créditos.'),
      });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid || this.saving()) return;

    const values = this.form.getRawValue();
    const unitPriceCents = Math.round(Number(values.unitPrice) * 100);
    if (!Number.isInteger(unitPriceCents) || unitPriceCents < 1) return;

    this.saving.set(true);
    this.error.set(null);
    this.success.set(null);
    this.service
      .setPrice({
        unitPriceCents,
        ...(values.effectiveFrom
          ? { effectiveFrom: new Date(values.effectiveFrom).toISOString() }
          : {}),
        ...(values.note.trim() ? { note: values.note.trim() } : {}),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: () => {
          this.success.set('Novo valor de crédito registrado com sucesso.');
          this.form.reset({ unitPrice: null, effectiveFrom: '', note: '' });
          this.load();
        },
        error: (error: Error) =>
          this.error.set(error.message || 'Não foi possível salvar o novo valor.'),
      });
  }
}

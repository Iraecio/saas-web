import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '../../../../core/services/notification';
import { ProfessionalService } from '../../services/professional';
import { Professional } from '../../../../core/models/professional.model';
import { ServiceScope } from '../../../../core/models/service.model';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type Tab = 'voice-actors' | 'producers';

@Component({
  selector: 'app-professionals-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  template: `
    <main class="mx-auto max-w-[90rem] space-y-6 p-4 sm:p-6 lg:p-8" id="main-content">
      <header
        class="flex flex-col gap-5 border-b border-neutral-200 pb-6 dark:border-neutral-800 lg:flex-row lg:items-end lg:justify-between"
      >
        <div>
          <p class="text-sm font-medium text-neutral-500 dark:text-neutral-400">Rede da revenda</p>
          <h1
            class="mt-1 text-3xl font-black tracking-[-0.04em] text-neutral-950 dark:text-white sm:text-4xl"
          >
            Profissionais
          </h1>
          <p
            class="mt-2 max-w-2xl text-sm leading-6 text-neutral-600 dark:text-neutral-300 sm:text-base"
          >
            Cadastre profissionais particulares e escolha exatamente o que seus clientes podem
            contratar.
          </p>
        </div>
        <div class="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            class="btn-secondary min-h-11"
            (click)="settingsOpen.set(!settingsOpen())"
            [attr.aria-expanded]="settingsOpen()"
          >
            Publicação do catálogo
          </button>
          <button type="button" class="btn-primary min-h-11" (click)="createOpen.set(true)">
            Cadastrar profissional
          </button>
        </div>
      </header>

      @if (settingsOpen()) {
        <section
          class="rounded-2xl bg-white p-5 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800 sm:p-6"
        >
          <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 class="text-lg font-semibold">Quem aparece para seus clientes</h2>
              <p class="mt-1 max-w-2xl text-sm text-neutral-500">
                Publique profissionais individualmente na lista ou aplique uma ação em todos os
                {{ tab() === 'voice-actors' ? 'locutores' : 'produtores' }} do filtro atual.
              </p>
            </div>
            <button
              type="button"
              class="text-sm font-medium underline underline-offset-4"
              (click)="settingsOpen.set(false)"
            >
              Fechar
            </button>
          </div>
          <div
            class="mt-5 flex flex-col gap-3 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-900 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p class="text-sm font-semibold">Ação rápida</p>
              <p class="text-xs text-neutral-500">
                {{
                  scopeFilter() === 'GLOBAL'
                    ? 'Somente profissionais da plataforma'
                    : scopeFilter() === 'PARTICULAR'
                      ? 'Somente profissionais da sua revenda'
                      : 'Profissionais da plataforma e da sua revenda'
                }}
              </p>
            </div>
            <div class="flex gap-2">
              <button
                type="button"
                class="btn-secondary inline-flex min-h-11 items-center justify-center gap-2"
                [disabled]="bulkSaving()"
                (click)="setAllVisible(false)"
              >
                <svg
                  aria-hidden="true"
                  class="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path d="M3 3l18 18" />
                  <path d="M10.6 10.7a2 2 0 002.7 2.7" />
                  <path
                    d="M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 5 9 5a16 16 0 01-2.1 2.7M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5a10 10 0 004.1-.8"
                  />
                </svg>
                Ocultar todos</button
              ><button
                type="button"
                class="btn-primary inline-flex min-h-11 items-center justify-center gap-2"
                [disabled]="bulkSaving()"
                (click)="setAllVisible(true)"
              >
                <svg
                  aria-hidden="true"
                  class="size-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.8"
                >
                  <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                  <circle cx="12" cy="12" r="2.5" />
                </svg>
                Mostrar todos
              </button>
            </div>
          </div>
        </section>
      }

      <section class="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Resumo da rede">
        <article
          class="rounded-2xl bg-white p-4 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
        >
          <p class="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <svg
              aria-hidden="true"
              class="size-4 text-emerald-600"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
              <circle cx="12" cy="12" r="2.5" /></svg
            >Visíveis nesta página
          </p>
          <p class="mt-2 text-2xl font-semibold tabular-nums">{{ visibleCount() }}</p>
        </article>
        <article
          class="rounded-2xl bg-white p-4 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
        >
          <p class="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <svg
              aria-hidden="true"
              class="size-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            >
              <path d="M3 3l18 18" />
              <path d="M10.6 10.7a2 2 0 002.7 2.7" />
              <path
                d="M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 5 9 5a16 16 0 01-2.1 2.7M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5a10 10 0 004.1-.8"
              /></svg
            >Ocultos nesta página
          </p>
          <p class="mt-2 text-2xl font-semibold tabular-nums">{{ hiddenCount() }}</p>
        </article>
        <article
          class="rounded-2xl bg-white p-4 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
        >
          <p class="text-xs font-medium text-neutral-500">Da sua revenda</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums">{{ particularCount() }}</p>
        </article>
        <article
          class="rounded-2xl bg-neutral-900 p-4 text-white dark:bg-white dark:text-neutral-950"
        >
          <p class="text-xs font-medium opacity-70">Da plataforma</p>
          <p class="mt-2 text-2xl font-semibold tabular-nums">{{ globalCount() }}</p>
        </article>
      </section>

      <section
        class="flex flex-col gap-3 rounded-2xl bg-white p-3 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800 sm:flex-row sm:items-center sm:justify-between"
        aria-label="Filtros"
      >
        <div
          class="grid grid-cols-2 rounded-xl bg-neutral-100 p-1 dark:bg-neutral-900"
          role="tablist"
          aria-label="Tipo de profissional"
        >
          <button
            type="button"
            role="tab"
            class="min-h-11 rounded-lg px-4 text-sm font-medium transition-colors"
            [class.bg-white]="tab() === 'voice-actors'"
            [class.shadow-sm]="tab() === 'voice-actors'"
            [class.dark:bg-neutral-800]="tab() === 'voice-actors'"
            [attr.aria-selected]="tab() === 'voice-actors'"
            (click)="setTab('voice-actors')"
          >
            Locutores
          </button>
          <button
            type="button"
            role="tab"
            class="min-h-11 rounded-lg px-4 text-sm font-medium transition-colors"
            [class.bg-white]="tab() === 'producers'"
            [class.shadow-sm]="tab() === 'producers'"
            [class.dark:bg-neutral-800]="tab() === 'producers'"
            [attr.aria-selected]="tab() === 'producers'"
            (click)="setTab('producers')"
          >
            Produtores
          </button>
        </div>
        <label class="flex items-center gap-3 sm:w-auto">
          <span class="text-sm font-medium text-neutral-600 dark:text-neutral-300">Escopo</span>
          <select
            class="form-input min-h-11 flex-1 sm:w-52"
            [value]="scopeFilter()"
            (change)="onScope($any($event.target).value)"
          >
            <option value="">Toda a rede</option>
            <option value="GLOBAL">Globais</option>
            <option value="PARTICULAR">Minha revenda</option>
          </select>
        </label>
      </section>

      @if (error()) {
        <div
          role="alert"
          class="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
        >
          <p class="font-semibold">Não foi possível carregar os profissionais</p>
          <p class="mt-1">{{ error() }}</p>
          <button class="mt-3 font-semibold underline underline-offset-4" (click)="load()">
            Tentar novamente
          </button>
        </div>
      } @else if (loading()) {
        <div class="space-y-3" aria-label="Carregando profissionais">
          @for (_ of [1, 2, 3, 4, 5]; track $index) {
            <div class="h-20 animate-pulse rounded-2xl bg-neutral-200/70 dark:bg-neutral-800"></div>
          }
        </div>
      } @else if (professionals().length === 0) {
        <div
          class="rounded-2xl border border-dashed border-neutral-300 px-6 py-14 text-center dark:border-neutral-700"
        >
          <h2 class="font-semibold">Nenhum profissional encontrado</h2>
          <p class="mt-1 text-sm text-neutral-500">
            Altere o tipo ou o escopo selecionado para ampliar a busca.
          </p>
          <button class="btn-secondary mt-5" type="button" (click)="clearFilter()">
            Mostrar toda a rede
          </button>
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
                <th class="px-4 py-3 font-medium">Escopo</th>
                <th class="px-4 py-3 font-medium">Verificação</th>
                <th class="px-5 py-3 text-right font-medium">Visível ao cliente</th>
              </tr>
            </thead>
            <tbody
              class="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-950"
            >
              @for (p of professionals(); track p.id) {
                <tr class="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/70">
                  <td class="px-5 py-4">
                    <div class="flex items-center gap-3">
                      <div
                        class="grid size-10 place-items-center rounded-xl bg-neutral-100 font-semibold dark:bg-neutral-800"
                      >
                        {{ initials(p.name) }}
                      </div>
                      <div>
                        <p class="font-semibold text-neutral-950 dark:text-white">{{ p.name }}</p>
                        <p class="text-xs text-neutral-500">
                          {{ p.email || (tab() === 'voice-actors' ? 'Locutor(a)' : 'Produtor(a)') }}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-4">
                    <span class="inline-flex items-center gap-2"
                      ><span
                        class="size-1.5 rounded-full"
                        [class.bg-emerald-500]="p.scope === 'PARTICULAR'"
                        [class.bg-neutral-400]="p.scope === 'GLOBAL'"
                      ></span
                      >{{ p.scope === 'GLOBAL' ? 'Global' : 'Minha revenda' }}</span
                    >
                  </td>
                  <td class="px-4 py-4">{{ verificationLabel(p.verificationStatus) }}</td>
                  <td class="px-5 py-4 text-right">
                    <button
                      type="button"
                      class="inline-flex min-h-12 min-w-48 items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors"
                      [class.border-emerald-200]="isVisible(p)"
                      [class.bg-emerald-50]="isVisible(p)"
                      [class.text-emerald-900]="isVisible(p)"
                      [class.dark:border-emerald-900]="isVisible(p)"
                      [class.dark:bg-emerald-950/30]="isVisible(p)"
                      [class.dark:text-emerald-200]="isVisible(p)"
                      [class.border-neutral-300]="!isVisible(p)"
                      [class.bg-neutral-100]="!isVisible(p)"
                      [class.text-neutral-600]="!isVisible(p)"
                      [class.dark:border-neutral-700]="!isVisible(p)"
                      [class.dark:bg-neutral-900]="!isVisible(p)"
                      [class.dark:text-neutral-300]="!isVisible(p)"
                      [disabled]="visibilityUpdatingId() === professionalKey(p)"
                      (click)="toggleVisibility(p, !isVisible(p))"
                      [attr.aria-label]="
                        (isVisible(p) ? 'Ocultar ' : 'Mostrar ') + p.name + ' aos clientes'
                      "
                    >
                      @if (isVisible(p)) {
                        <svg
                          aria-hidden="true"
                          class="size-5 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                        >
                          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                          <circle cx="12" cy="12" r="2.5" /></svg
                        ><span
                          ><b class="block text-sm">Visível ao cliente</b
                          ><small class="block opacity-70">Pode ser contratado</small></span
                        >
                      } @else {
                        <svg
                          aria-hidden="true"
                          class="size-5 shrink-0"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="1.8"
                        >
                          <path d="M3 3l18 18" />
                          <path d="M10.6 10.7a2 2 0 002.7 2.7" />
                          <path
                            d="M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 5 9 5a16 16 0 01-2.1 2.7M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5a10 10 0 004.1-.8"
                          /></svg
                        ><span
                          ><b class="block text-sm">Oculto do cliente</b
                          ><small class="block opacity-70">Não pode ser contratado</small></span
                        >
                      }
                    </button>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div class="grid gap-3 md:hidden">
          @for (p of professionals(); track p.id) {
            <article
              class="rounded-2xl bg-white p-5 ring-1 ring-neutral-200/80 dark:bg-neutral-950 dark:ring-neutral-800"
            >
              <div class="flex items-start gap-3">
                <div
                  class="grid size-11 place-items-center rounded-xl bg-neutral-100 font-semibold dark:bg-neutral-800"
                >
                  {{ initials(p.name) }}
                </div>
                <div class="min-w-0 flex-1">
                  <h2 class="truncate font-semibold">{{ p.name }}</h2>
                  <p class="text-sm text-neutral-500">
                    {{ tab() === 'voice-actors' ? 'Locutor(a)' : 'Produtor(a)' }}
                  </p>
                </div>
                <span class="text-xs font-medium">{{
                  p.scope === 'GLOBAL' ? 'Global' : 'Minha rede'
                }}</span>
              </div>
              <div class="my-4 border-y border-neutral-200 py-3 text-sm dark:border-neutral-800">
                <span class="text-neutral-500">Verificação</span
                ><span class="float-right font-medium">{{
                  verificationLabel(p.verificationStatus)
                }}</span>
              </div>
              <button
                type="button"
                class="flex min-h-14 w-full items-center gap-3 rounded-xl border px-4 text-left"
                [class.border-emerald-200]="isVisible(p)"
                [class.bg-emerald-50]="isVisible(p)"
                [class.text-emerald-900]="isVisible(p)"
                [class.dark:border-emerald-900]="isVisible(p)"
                [class.dark:bg-emerald-950/30]="isVisible(p)"
                [class.dark:text-emerald-200]="isVisible(p)"
                [class.border-neutral-300]="!isVisible(p)"
                [class.bg-neutral-100]="!isVisible(p)"
                [class.text-neutral-600]="!isVisible(p)"
                [class.dark:border-neutral-700]="!isVisible(p)"
                [class.dark:bg-neutral-900]="!isVisible(p)"
                [class.dark:text-neutral-300]="!isVisible(p)"
                [disabled]="visibilityUpdatingId() === professionalKey(p)"
                (click)="toggleVisibility(p, !isVisible(p))"
                [attr.aria-label]="
                  (isVisible(p) ? 'Ocultar ' : 'Mostrar ') + p.name + ' aos clientes'
                "
              >
                @if (isVisible(p)) {
                  <svg
                    aria-hidden="true"
                    class="size-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6z" />
                    <circle cx="12" cy="12" r="2.5" /></svg
                  ><span
                    ><b class="block text-sm">Visível ao cliente</b
                    ><small class="opacity-70">Toque para ocultar</small></span
                  >
                } @else {
                  <svg
                    aria-hidden="true"
                    class="size-5 shrink-0"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.8"
                  >
                    <path d="M3 3l18 18" />
                    <path d="M10.6 10.7a2 2 0 002.7 2.7" />
                    <path
                      d="M9.9 4.2A10.8 10.8 0 0112 4c5.5 0 9 5 9 5a16 16 0 01-2.1 2.7M6.6 6.6C4.3 8.1 3 10 3 10s3.5 5 9 5a10 10 0 004.1-.8"
                    /></svg
                  ><span
                    ><b class="block text-sm">Oculto do cliente</b
                    ><small class="opacity-70">Toque para publicar</small></span
                  >
                }
              </button>
            </article>
          }
        </div>

        @if (totalPages() > 1) {
          <nav class="flex items-center justify-between" aria-label="Paginação">
            <p class="text-sm text-neutral-500">Página {{ page() }} de {{ totalPages() }}</p>
            <div class="flex gap-2">
              <button
                class="btn-secondary min-h-11"
                [disabled]="page() === 1"
                (click)="changePage(-1)"
              >
                Anterior</button
              ><button
                class="btn-secondary min-h-11"
                [disabled]="page() === totalPages()"
                (click)="changePage(1)"
              >
                Próxima
              </button>
            </div>
          </nav>
        }
      }
    </main>

    @if (createOpen()) {
      <div
        class="fixed inset-0 z-50 grid place-items-center bg-neutral-950/55 p-4 backdrop-blur-sm"
        role="presentation"
        (click)="closeCreate()"
      >
        <section
          class="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl dark:bg-neutral-950"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-professional-title"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-sm font-medium text-neutral-500">Profissional particular</p>
              <h2 id="create-professional-title" class="mt-1 text-2xl font-bold tracking-tight">
                Cadastrar na sua revenda
              </h2>
            </div>
            <button type="button" class="btn-secondary min-h-11" (click)="closeCreate()">
              Fechar
            </button>
          </div>
          <form class="mt-6 space-y-4" [formGroup]="createForm" (ngSubmit)="createProfessional()">
            <div class="grid gap-4 sm:grid-cols-2">
              <label
                ><span class="form-label">Tipo</span
                ><select class="form-input min-h-11" formControlName="role">
                  <option value="VOICE_ACTOR">Locutor(a)</option>
                  <option value="PRODUCER">Produtor(a)</option>
                </select></label
              ><label
                ><span class="form-label">Nome</span
                ><input class="form-input min-h-11" formControlName="name" autocomplete="name"
              /></label>
            </div>
            <label
              ><span class="form-label">E-mail de acesso</span
              ><input
                class="form-input min-h-11"
                type="email"
                formControlName="email"
                autocomplete="email"
            /></label>
            <label
              ><span class="form-label">Senha inicial</span
              ><input
                class="form-input min-h-11"
                type="password"
                formControlName="password"
                autocomplete="new-password"
                aria-describedby="password-help"
              /><small id="password-help" class="mt-1 block text-neutral-500"
                >Use pelo menos 8 caracteres e compartilhe a senha por um canal seguro.</small
              ></label
            >
            <label
              ><span class="form-label"
                >Resumo <span class="font-normal text-neutral-500">(opcional)</span></span
              ><textarea
                class="form-input min-h-24 resize-y"
                formControlName="summary"
                placeholder="Especialidade, experiência ou estrutura disponível"
              ></textarea>
            </label>
            @if (createError()) {
              <p role="alert" class="text-sm text-red-600 dark:text-red-400">{{ createError() }}</p>
            }
            <div class="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button type="button" class="btn-secondary min-h-11" (click)="closeCreate()">
                Cancelar</button
              ><button class="btn-primary min-h-11" [disabled]="createForm.invalid || creating()">
                {{ creating() ? 'Cadastrando…' : 'Cadastrar profissional' }}
              </button>
            </div>
          </form>
        </section>
      </div>
    }
  `,
})
export class ProfessionalsListPage {
  private readonly svc = inject(ProfessionalService);
  private readonly notify = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly tab = signal<Tab>('voice-actors');
  readonly scopeFilter = signal<ServiceScope | ''>('');
  readonly professionals = signal<Professional[]>([]);
  readonly loading = signal(true);
  readonly error = signal('');
  readonly page = signal(1);
  readonly total = signal(0);
  readonly pageSize = 20;
  readonly settingsOpen = signal(false);
  readonly bulkSaving = signal(false);
  readonly visibilityUpdatingId = signal<string | null>(null);
  readonly hiddenProfessionalIds = signal<string[]>([]);
  readonly createOpen = signal(false);
  readonly creating = signal(false);
  readonly createError = signal('');
  readonly createForm = new FormGroup({
    role: new FormControl<'VOICE_ACTOR' | 'PRODUCER'>('VOICE_ACTOR', { nonNullable: true }),
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(8)],
    }),
    summary: new FormControl('', { nonNullable: true }),
  });

  readonly globalCount = computed(
    () => this.professionals().filter((item) => item.scope === 'GLOBAL').length,
  );
  readonly particularCount = computed(
    () => this.professionals().filter((item) => item.scope === 'PARTICULAR').length,
  );
  readonly visibleCount = computed(
    () => this.professionals().filter((item) => this.isVisible(item)).length,
  );
  readonly hiddenCount = computed(() => this.professionals().length - this.visibleCount());
  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize)));

  constructor() {
    this.load();
    this.svc
      .getCatalogVisibility()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => this.hiddenProfessionalIds.set(result.hiddenProfessionalIds),
      });
  }

  setTab(tab: Tab): void {
    if (this.tab() === tab) return;
    this.tab.set(tab);
    this.page.set(1);
    this.load();
  }

  onScope(value: string): void {
    this.scopeFilter.set((value as ServiceScope) || '');
    this.page.set(1);
    this.load();
  }

  clearFilter(): void {
    this.scopeFilter.set('');
    this.page.set(1);
    this.load();
  }

  changePage(delta: number): void {
    const next = Math.min(this.totalPages(), Math.max(1, this.page() + delta));
    if (next === this.page()) return;
    this.page.set(next);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    const filters = {
      scope: this.scopeFilter() || undefined,
      page: this.page(),
      limit: this.pageSize,
    };
    const req =
      this.tab() === 'voice-actors'
        ? this.svc.listVoiceActors(filters)
        : this.svc.listProducers(filters);
    req.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        this.professionals.set(res.professionals ?? []);
        this.total.set(res.pagination?.total ?? res.professionals?.length ?? 0);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set(err.message ?? 'Erro ao carregar profissionais');
        this.loading.set(false);
      },
    });
  }

  professionalKey(professional: Professional): string {
    return professional.userId || professional.id;
  }

  isVisible(professional: Professional): boolean {
    return !this.hiddenProfessionalIds().includes(this.professionalKey(professional));
  }

  toggleVisibility(professional: Professional, isVisible: boolean): void {
    const professionalId = this.professionalKey(professional);
    if (this.visibilityUpdatingId()) return;
    this.visibilityUpdatingId.set(professionalId);
    this.svc.updateProfessionalVisibility(professionalId, isVisible).subscribe({
      next: (result) => {
        this.hiddenProfessionalIds.set(result.hiddenProfessionalIds);
        this.visibilityUpdatingId.set(null);
      },
      error: (err) => {
        this.visibilityUpdatingId.set(null);
        this.notify.error(err.message ?? 'Não foi possível alterar a publicação.');
      },
    });
  }

  setAllVisible(isVisible: boolean): void {
    if (this.bulkSaving()) return;
    this.bulkSaving.set(true);
    const role = this.tab() === 'voice-actors' ? 'VOICE_ACTOR' : 'PRODUCER';
    this.svc.updateBulkVisibility(role, isVisible, this.scopeFilter() || undefined).subscribe({
      next: (result) => {
        this.hiddenProfessionalIds.set(result.hiddenProfessionalIds);
        this.bulkSaving.set(false);
        this.notify.success(isVisible ? 'Profissionais publicados.' : 'Profissionais ocultados.');
      },
      error: (err) => {
        this.bulkSaving.set(false);
        this.notify.error(err.message ?? 'Não foi possível atualizar o catálogo.');
      },
    });
  }

  createProfessional(): void {
    this.createForm.markAllAsTouched();
    if (this.createForm.invalid || this.creating()) return;
    this.creating.set(true);
    this.createError.set('');
    const value = this.createForm.getRawValue();
    this.svc
      .createPrivateProfessional({
        ...value,
        name: value.name.trim(),
        email: value.email.trim().toLowerCase(),
        summary: value.summary.trim() || undefined,
      })
      .subscribe({
        next: () => {
          this.creating.set(false);
          this.closeCreate();
          this.scopeFilter.set('PARTICULAR');
          this.page.set(1);
          this.tab.set(value.role === 'VOICE_ACTOR' ? 'voice-actors' : 'producers');
          this.notify.success('Profissional cadastrado e vinculado à sua revenda.');
          this.load();
        },
        error: (err) => {
          this.creating.set(false);
          this.createError.set(err.message ?? 'Não foi possível cadastrar o profissional.');
        },
      });
  }

  closeCreate(): void {
    if (this.creating()) return;
    this.createOpen.set(false);
    this.createError.set('');
    this.createForm.reset({
      role: 'VOICE_ACTOR',
      name: '',
      email: '',
      password: '',
      summary: '',
    });
  }

  initials(name: string): string {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase();
  }

  verificationLabel(status?: string): string {
    if (!status) return 'Não informada';
    const labels: Record<string, string> = {
      VERIFIED: 'Verificado',
      PENDING: 'Pendente',
      REJECTED: 'Não aprovado',
    };
    return labels[status] ?? status;
  }
}

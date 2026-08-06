import { CurrencyPipe, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  ArrowRight,
  BadgeDollarSign,
  Check,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Clock3,
  History,
  LoaderCircle,
  LucideAngularModule,
  MessageSquareText,
  Mic2,
  Power,
  RefreshCw,
  Send,
  SlidersHorizontal,
  X,
} from 'lucide-angular';
import {
  NegotiationStatus,
  ProfessionalOffering,
  ServicePriceNegotiation,
} from '../../../../core/models/professional.model';
import { AppStateService } from '../../../../core/services/app-state';
import { NotificationService } from '../../../../core/services/notification';
import { ProfessionalService } from '../../services/professional';

@Component({
  selector: 'app-my-services',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe, DatePipe, FormsModule, LucideAngularModule],
  template: `
    <main class="mx-auto max-w-6xl space-y-6 p-4 sm:p-6 lg:p-8">
      <header class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-brand">
            <lucide-icon [img]="Mic2" class="size-4" />
            Painel do locutor
          </div>
          <h1 class="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Meus Serviços
          </h1>
          <p class="mt-1 max-w-2xl text-sm text-muted sm:text-base">
            Escolha os serviços que deseja oferecer e negocie seus valores com a plataforma.
          </p>
        </div>
        <button
          type="button"
          class="btn-secondary self-start"
          [disabled]="loading()"
          (click)="loadOfferings()"
        >
          <lucide-icon [img]="RefreshCw" class="size-4" [class.animate-spin]="loading()" />
          Atualizar
        </button>
      </header>

      <section class="grid gap-4 sm:grid-cols-3">
        <article class="summary-card">
          <span
            class="summary-icon bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400"
          >
            <lucide-icon [img]="SlidersHorizontal" class="size-5" />
          </span>
          <div>
            <p class="text-sm text-muted">Serviços disponíveis</p>
            <strong class="mt-0.5 block text-2xl text-foreground">{{ offerings().length }}</strong>
          </div>
        </article>
        <article class="summary-card">
          <span
            class="summary-icon bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
          >
            <lucide-icon [img]="Power" class="size-5" />
          </span>
          <div>
            <p class="text-sm text-muted">Serviços ativos</p>
            <strong class="mt-0.5 block text-2xl text-foreground">{{ activeCount() }}</strong>
          </div>
        </article>
        <article class="summary-card">
          <span
            class="summary-icon bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
          >
            <lucide-icon [img]="Clock3" class="size-5" />
          </span>
          <div>
            <p class="text-sm text-muted">Em negociação</p>
            <strong class="mt-0.5 block text-2xl text-foreground">{{ pendingCount() }}</strong>
          </div>
        </article>
      </section>

      <section
        class="rounded-2xl border border-blue-200 bg-blue-50/80 p-4 dark:border-blue-900/60 dark:bg-blue-950/20"
      >
        <div class="flex gap-3">
          <lucide-icon
            [img]="CircleAlert"
            class="mt-0.5 size-5 shrink-0 text-blue-600 dark:text-blue-400"
          />
          <div class="text-sm">
            <p class="font-semibold text-blue-900 dark:text-blue-200">
              Como funciona a negociação?
            </p>
            <p class="mt-1 leading-6 text-blue-800/80 dark:text-blue-300/80">
              O valor atual continua válido enquanto sua proposta é analisada. A plataforma pode
              aceitar, recusar ou enviar uma contraproposta para sua decisão.
            </p>
          </div>
        </div>
      </section>

      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex rounded-xl bg-surface-subtle p-1">
          @for (filter of filters; track filter.value) {
            <button
              type="button"
              class="rounded-lg px-3 py-2 text-sm font-medium transition-colors"
              [class]="
                selectedFilter() === filter.value
                  ? 'bg-surface text-foreground shadow-sm'
                  : 'text-muted hover:text-foreground'
              "
              (click)="selectedFilter.set(filter.value)"
            >
              {{ filter.label }}
            </button>
          }
        </div>
        <p class="text-sm text-muted">{{ filteredOfferings().length }} serviço(s)</p>
      </div>

      @if (loading()) {
        <section class="grid gap-4 md:grid-cols-2">
          @for (item of [1, 2, 3, 4]; track item) {
            <div class="h-56 animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800"></div>
          }
        </section>
      } @else if (loadError()) {
        <section class="empty-state" role="alert">
          <span class="empty-icon bg-red-50 text-red-500 dark:bg-red-950/30">
            <lucide-icon [img]="CircleAlert" class="size-6" />
          </span>
          <h2 class="mt-4 font-semibold text-foreground">
            Não foi possível carregar seus serviços
          </h2>
          <p class="mt-1 text-sm text-muted">{{ loadError() }}</p>
          <button type="button" class="btn-primary mt-5" (click)="loadOfferings()">
            Tentar novamente
          </button>
        </section>
      } @else if (!filteredOfferings().length) {
        <section class="empty-state">
          <span class="empty-icon bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400">
            <lucide-icon [img]="Mic2" class="size-6" />
          </span>
          <h2 class="mt-4 font-semibold text-foreground">Nenhum serviço encontrado</h2>
          <p class="mt-1 max-w-md text-sm text-muted">
            Não há serviços para o filtro selecionado. As ofertas padrão aparecem aqui
            automaticamente.
          </p>
        </section>
      } @else {
        <section class="grid items-start gap-4 md:grid-cols-2">
          @for (offering of filteredOfferings(); track offering.serviceId) {
            <article
              class="service-card"
              [class.opacity-75]="!offering.active"
              [class.border-amber-300]="offering.pendingNegotiationId"
              [class.dark:border-amber-800]="offering.pendingNegotiationId"
            >
              <div class="p-5 sm:p-6">
                <div class="flex items-start justify-between gap-4">
                  <span
                    class="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600 dark:bg-violet-950/40 dark:text-violet-400"
                  >
                    <lucide-icon [img]="Mic2" class="size-5" />
                  </span>
                  <span
                    class="status-badge"
                    [class]="offering.active ? 'status-active' : 'status-inactive'"
                  >
                    <span class="size-1.5 rounded-full bg-current"></span>
                    {{ offering.active ? 'Ativo' : 'Inativo' }}
                  </span>
                </div>

                <h2 class="mt-4 text-lg font-semibold text-foreground">
                  {{ offering.serviceName }}
                </h2>
                <p class="mt-1 text-xs font-medium uppercase tracking-wide text-muted">
                  Serviço de locução · {{ scopeLabel(offering.scope) }}
                </p>
                @if (!offering.active) {
                  <p
                    class="mt-3 rounded-lg bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                  >
                    Ative este serviço para começar a oferecê-lo e, se necessário, negociar outro
                    valor.
                  </p>
                }

                <div class="mt-5 flex items-end justify-between gap-4 border-t border-border pt-4">
                  <div>
                    <p class="text-xs text-muted">Seu valor atual</p>
                    <p class="mt-1 text-2xl font-bold text-foreground">
                      {{
                        offering.priceCents / 100 | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR'
                      }}
                    </p>
                    <p class="mt-0.5 text-xs text-muted">por serviço concluído</p>
                  </div>
                  @if (offering.pendingNegotiationId) {
                    <span
                      class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/50 dark:text-amber-300"
                    >
                      Em análise
                    </span>
                  }
                </div>

                <div class="mt-5 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    class="btn-secondary px-3"
                    [disabled]="
                      !offering.active ||
                      !!offering.pendingNegotiationId ||
                      togglingId() === offering.serviceId
                    "
                    (click)="openProposal(offering)"
                  >
                    <lucide-icon [img]="BadgeDollarSign" class="size-4" />
                    Renegociar
                  </button>
                  <button
                    type="button"
                    class="btn-ghost border border-border px-3"
                    [disabled]="togglingId() === offering.serviceId"
                    (click)="toggleOffering(offering)"
                  >
                    @if (togglingId() === offering.serviceId) {
                      <lucide-icon [img]="LoaderCircle" class="size-4 animate-spin" />
                    } @else {
                      <lucide-icon [img]="Power" class="size-4" />
                    }
                    {{ offering.active ? 'Desativar' : 'Ativar' }}
                  </button>
                </div>
              </div>

              <button
                type="button"
                class="flex w-full items-center justify-between border-t border-border px-5 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface-subtle hover:text-foreground sm:px-6"
                (click)="toggleHistory(offering)"
              >
                <span class="flex items-center gap-2">
                  <lucide-icon [img]="History" class="size-4" />
                  Histórico de negociação
                </span>
                <lucide-icon
                  [img]="expandedServiceId() === offering.serviceId ? ChevronUp : ChevronDown"
                  class="size-4"
                />
              </button>

              @if (expandedServiceId() === offering.serviceId) {
                <div class="border-t border-border bg-surface-subtle/60 p-5 sm:p-6">
                  @if (historyLoadingId() === offering.serviceId) {
                    <div class="flex items-center justify-center gap-2 py-6 text-sm text-muted">
                      <lucide-icon [img]="LoaderCircle" class="size-4 animate-spin" />
                      Carregando histórico...
                    </div>
                  } @else if (historyError()[offering.serviceId]) {
                    <p class="py-4 text-center text-sm text-red-600">
                      {{ historyError()[offering.serviceId] }}
                    </p>
                  } @else if (!historyFor(offering.serviceId).length) {
                    <p class="py-5 text-center text-sm text-muted">Nenhuma negociação realizada.</p>
                  } @else {
                    <div class="space-y-4">
                      @for (negotiation of historyFor(offering.serviceId); track negotiation.id) {
                        <div class="relative border-l-2 border-border pl-4">
                          <span
                            class="absolute -left-[5px] top-1.5 size-2 rounded-full"
                            [class]="timelineDotClass(negotiation.status)"
                          ></span>
                          <div class="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <p class="text-sm font-semibold text-foreground">
                                {{ initiatorLabel(negotiation.initiator) }} propôs
                                {{
                                  negotiation.proposedPriceCents / 100
                                    | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR'
                                }}
                              </p>
                              <p class="mt-0.5 text-xs text-muted">
                                Valor anterior:
                                {{
                                  negotiation.previousPriceCents / 100
                                    | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR'
                                }}
                              </p>
                            </div>
                            <span
                              class="rounded-full px-2 py-0.5 text-[11px] font-semibold"
                              [class]="negotiationBadgeClass(negotiation.status)"
                            >
                              {{ negotiationStatusLabel(negotiation.status) }}
                            </span>
                          </div>
                          @if (negotiation.notes) {
                            <p
                              class="mt-2 rounded-lg bg-surface px-3 py-2 text-xs leading-5 text-muted"
                            >
                              “{{ negotiation.notes }}”
                            </p>
                          }
                          <p class="mt-2 text-[11px] text-muted">
                            {{ negotiation.createdAt | date: 'dd/MM/yyyy HH:mm' }}
                          </p>

                          @if (canDecide(negotiation)) {
                            <div class="mt-3 flex gap-2">
                              <button
                                type="button"
                                class="btn-primary min-h-9 px-3 py-1.5 text-xs"
                                [disabled]="decidingId() === negotiation.id"
                                (click)="decide(offering, negotiation, 'accept')"
                              >
                                <lucide-icon [img]="Check" class="size-3.5" /> Aceitar
                                contraproposta
                              </button>
                              <button
                                type="button"
                                class="btn-secondary min-h-9 px-3 py-1.5 text-xs"
                                [disabled]="decidingId() === negotiation.id"
                                (click)="decide(offering, negotiation, 'reject')"
                              >
                                <lucide-icon [img]="X" class="size-3.5" /> Recusar
                              </button>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
            </article>
          }
        </section>
      }
    </main>

    @if (proposalService(); as service) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/60 p-4 backdrop-blur-sm"
        (click)="closeProposal()"
      >
        <section
          class="w-full max-w-lg rounded-2xl border border-border bg-surface shadow-2xl"
          role="dialog"
          aria-modal="true"
          aria-labelledby="proposal-title"
          (click)="$event.stopPropagation()"
        >
          <div class="flex items-start justify-between border-b border-border p-5 sm:p-6">
            <div>
              <div class="mb-2 flex items-center gap-2 text-sm font-semibold text-brand">
                <lucide-icon [img]="MessageSquareText" class="size-4" /> Nova proposta
              </div>
              <h2 id="proposal-title" class="text-xl font-bold text-foreground">
                Renegociar valor
              </h2>
              <p class="mt-1 text-sm text-muted">{{ service.serviceName }}</p>
            </div>
            <button type="button" class="btn-icon" aria-label="Fechar" (click)="closeProposal()">
              <lucide-icon [img]="X" class="size-5" />
            </button>
          </div>

          <div class="space-y-5 p-5 sm:p-6">
            <div class="rounded-xl bg-surface-subtle p-4">
              <p class="text-xs text-muted">Valor vigente</p>
              <p class="mt-1 text-xl font-bold text-foreground">
                {{ service.priceCents / 100 | currency: 'BRL' : 'symbol' : '1.2-2' : 'pt-BR' }}
              </p>
            </div>

            <div>
              <label for="proposed-price" class="form-label">Novo valor desejado</label>
              <div class="relative">
                <span
                  class="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-medium text-muted"
                  >R$</span
                >
                <input
                  id="proposed-price"
                  type="text"
                  inputmode="decimal"
                  autocomplete="off"
                  class="form-input pl-10 text-lg font-semibold"
                  placeholder="0,00"
                  [(ngModel)]="proposedPrice"
                  (ngModelChange)="proposalError.set('')"
                />
              </div>
            </div>

            <div>
              <label for="proposal-notes" class="form-label"
                >Justificativa <span class="font-normal text-muted">(opcional)</span></label
              >
              <textarea
                id="proposal-notes"
                rows="4"
                maxlength="500"
                class="form-input resize-none"
                placeholder="Explique o motivo do novo valor..."
                [(ngModel)]="proposalNotes"
              ></textarea>
              <p class="mt-1 text-right text-xs text-muted">{{ proposalNotes.length }}/500</p>
            </div>

            @if (proposalError()) {
              <p
                class="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300"
                role="alert"
              >
                {{ proposalError() }}
              </p>
            }

            <div class="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                class="btn-secondary"
                [disabled]="submittingProposal()"
                (click)="closeProposal()"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="btn-primary"
                [disabled]="submittingProposal()"
                (click)="submitProposal()"
              >
                @if (submittingProposal()) {
                  <lucide-icon [img]="LoaderCircle" class="size-4 animate-spin" /> Enviando...
                } @else {
                  <lucide-icon [img]="Send" class="size-4" /> Enviar proposta
                }
              </button>
            </div>
          </div>
        </section>
      </div>
    }
  `,
  styles: `
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
    .empty-icon {
      display: flex;
      width: 2.75rem;
      height: 2.75rem;
      flex: 0 0 auto;
      align-items: center;
      justify-content: center;
      border-radius: 0.875rem;
    }
    .service-card {
      overflow: hidden;
      border: 1px solid var(--ui-border);
      border-radius: 1rem;
      background: var(--ui-surface);
      box-shadow: 0 1px 3px rgba(15, 23, 42, 0.05);
      transition:
        border-color 150ms,
        box-shadow 150ms,
        opacity 150ms;
    }
    .service-card:hover {
      box-shadow: 0 14px 30px -24px rgba(37, 99, 235, 0.5);
    }
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.375rem;
      border-radius: 9999px;
      padding: 0.3rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .status-active {
      background: rgb(220 252 231);
      color: rgb(21 128 61);
    }
    .status-inactive {
      background: rgb(245 245 245);
      color: rgb(82 82 82);
    }
    :host-context(.dark) .status-active {
      background: rgba(20, 83, 45, 0.4);
      color: rgb(134 239 172);
    }
    :host-context(.dark) .status-inactive {
      background: rgb(38 38 38);
      color: rgb(163 163 163);
    }
    .empty-state {
      display: flex;
      min-height: 18rem;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 1px dashed var(--ui-border-strong);
      border-radius: 1rem;
      background: var(--ui-surface);
      padding: 2rem;
      text-align: center;
    }
  `,
})
export class MyServicesPage implements OnInit {
  private readonly professionalService = inject(ProfessionalService);
  private readonly appState = inject(AppStateService);
  private readonly notificationsService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly offerings = signal<ProfessionalOffering[]>([]);
  readonly loading = signal(true);
  readonly loadError = signal('');
  readonly selectedFilter = signal<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  readonly togglingId = signal<string | null>(null);
  readonly expandedServiceId = signal<string | null>(null);
  readonly histories = signal<Record<string, ServicePriceNegotiation[]>>({});
  readonly historyError = signal<Record<string, string>>({});
  readonly historyLoadingId = signal<string | null>(null);
  readonly decidingId = signal<string | null>(null);

  readonly proposalService = signal<ProfessionalOffering | null>(null);
  readonly proposalError = signal('');
  readonly submittingProposal = signal(false);
  proposedPrice = '';
  proposalNotes = '';

  readonly activeCount = computed(() => this.offerings().filter((item) => item.active).length);
  readonly pendingCount = computed(
    () => this.offerings().filter((item) => !!item.pendingNegotiationId).length,
  );
  readonly filteredOfferings = computed(() => {
    const filter = this.selectedFilter();
    if (filter === 'ACTIVE') return this.offerings().filter((item) => item.active);
    if (filter === 'INACTIVE') return this.offerings().filter((item) => !item.active);
    return this.offerings();
  });

  readonly filters = [
    { label: 'Todos', value: 'ALL' as const },
    { label: 'Ativos', value: 'ACTIVE' as const },
    { label: 'Inativos', value: 'INACTIVE' as const },
  ];

  readonly ArrowRight = ArrowRight;
  readonly BadgeDollarSign = BadgeDollarSign;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;
  readonly ChevronUp = ChevronUp;
  readonly CircleAlert = CircleAlert;
  readonly Clock3 = Clock3;
  readonly History = History;
  readonly LoaderCircle = LoaderCircle;
  readonly MessageSquareText = MessageSquareText;
  readonly Mic2 = Mic2;
  readonly Power = Power;
  readonly RefreshCw = RefreshCw;
  readonly Send = Send;
  readonly SlidersHorizontal = SlidersHorizontal;
  readonly X = X;

  ngOnInit(): void {
    this.loadOfferings();
  }

  loadOfferings(): void {
    const professionalId = this.appState.user()?.id;
    if (!professionalId) {
      this.loading.set(false);
      this.loadError.set('Não foi possível identificar o locutor autenticado.');
      return;
    }
    this.loading.set(true);
    this.loadError.set('');
    this.professionalService
      .listOfferings(professionalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (offerings) => {
          this.offerings.set(offerings);
          this.loading.set(false);
        },
        error: (error: Error) => {
          this.loadError.set(error.message || 'Erro ao carregar os serviços.');
          this.loading.set(false);
        },
      });
  }

  toggleOffering(offering: ProfessionalOffering): void {
    const professionalId = this.appState.user()?.id;
    if (!professionalId || this.togglingId()) return;
    this.togglingId.set(offering.serviceId);
    this.professionalService
      .setOfferingActive(professionalId, offering.serviceId, !offering.active)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.offerings.update((items) =>
            items.map((item) =>
              item.serviceId === offering.serviceId ? { ...item, active: !offering.active } : item,
            ),
          );
          this.togglingId.set(null);
          this.notificationsService.success(
            offering.active ? 'Serviço desativado com sucesso.' : 'Serviço ativado com sucesso.',
          );
        },
        error: (error: Error) => {
          this.togglingId.set(null);
          this.notificationsService.error(error.message || 'Não foi possível alterar o serviço.');
        },
      });
  }

  openProposal(offering: ProfessionalOffering): void {
    if (!offering.active || offering.pendingNegotiationId) return;
    this.proposalService.set(offering);
    this.proposedPrice = (offering.priceCents / 100).toFixed(2).replace('.', ',');
    this.proposalNotes = '';
    this.proposalError.set('');
  }

  closeProposal(): void {
    if (this.submittingProposal()) return;
    this.proposalService.set(null);
  }

  submitProposal(): void {
    const professionalId = this.appState.user()?.id;
    const offering = this.proposalService();
    const proposedPriceCents = this.parsePriceToCents(this.proposedPrice);
    if (!professionalId || !offering) return;
    if (!proposedPriceCents || proposedPriceCents <= 0) {
      this.proposalError.set('Informe um valor válido maior que zero.');
      return;
    }
    if (proposedPriceCents === offering.priceCents) {
      this.proposalError.set('O novo valor deve ser diferente do valor atual.');
      return;
    }

    this.submittingProposal.set(true);
    this.proposalError.set('');
    this.professionalService
      .proposePrice(professionalId, offering.serviceId, {
        proposedPriceCents,
        notes: this.proposalNotes.trim() || undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (negotiation) => {
          this.offerings.update((items) =>
            items.map((item) =>
              item.serviceId === offering.serviceId
                ? { ...item, pendingNegotiationId: negotiation.id }
                : item,
            ),
          );
          this.histories.update((histories) => ({
            ...histories,
            [offering.serviceId]: [negotiation, ...(histories[offering.serviceId] ?? [])],
          }));
          this.submittingProposal.set(false);
          this.proposalService.set(null);
          this.notificationsService.success('Proposta enviada para análise.');
        },
        error: (error: Error) => {
          this.submittingProposal.set(false);
          this.proposalError.set(error.message || 'Não foi possível enviar a proposta.');
        },
      });
  }

  toggleHistory(offering: ProfessionalOffering): void {
    if (this.expandedServiceId() === offering.serviceId) {
      this.expandedServiceId.set(null);
      return;
    }
    this.expandedServiceId.set(offering.serviceId);
    this.loadHistory(offering.serviceId);
  }

  loadHistory(serviceId: string): void {
    const professionalId = this.appState.user()?.id;
    if (!professionalId) return;
    this.historyLoadingId.set(serviceId);
    this.historyError.update((errors) => ({ ...errors, [serviceId]: '' }));
    this.professionalService
      .listNegotiations(professionalId, serviceId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (history) => {
          this.histories.update((histories) => ({ ...histories, [serviceId]: history }));
          this.historyLoadingId.set(null);
        },
        error: (error: Error) => {
          this.historyError.update((errors) => ({
            ...errors,
            [serviceId]: error.message || 'Erro ao carregar o histórico.',
          }));
          this.historyLoadingId.set(null);
        },
      });
  }

  historyFor(serviceId: string): ServicePriceNegotiation[] {
    return this.histories()[serviceId] ?? [];
  }

  canDecide(negotiation: ServicePriceNegotiation): boolean {
    return negotiation.status === 'PENDING' && negotiation.initiator === 'MANAGER';
  }

  decide(
    offering: ProfessionalOffering,
    negotiation: ServicePriceNegotiation,
    decision: 'accept' | 'reject',
  ): void {
    const professionalId = this.appState.user()?.id;
    if (!professionalId || this.decidingId()) return;
    this.decidingId.set(negotiation.id);
    this.professionalService
      .decideNegotiation(professionalId, offering.serviceId, negotiation.id, decision)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.decidingId.set(null);
          this.offerings.update((items) =>
            items.map((item) =>
              item.serviceId === offering.serviceId
                ? {
                    ...item,
                    pendingNegotiationId: null,
                    priceCents:
                      decision === 'accept' ? negotiation.proposedPriceCents : item.priceCents,
                  }
                : item,
            ),
          );
          this.loadHistory(offering.serviceId);
          this.notificationsService.success(
            decision === 'accept' ? 'Contraproposta aceita.' : 'Contraproposta recusada.',
          );
        },
        error: (error: Error) => {
          this.decidingId.set(null);
          this.notificationsService.error(error.message || 'Não foi possível concluir a decisão.');
        },
      });
  }

  scopeLabel(scope: ProfessionalOffering['scope']): string {
    return scope === 'GLOBAL' ? 'Plataforma' : 'Revenda';
  }

  initiatorLabel(initiator: ServicePriceNegotiation['initiator']): string {
    return initiator === 'PROFESSIONAL' ? 'Você' : 'Gestor';
  }

  negotiationStatusLabel(status: NegotiationStatus): string {
    const labels: Record<NegotiationStatus, string> = {
      PENDING: 'Pendente',
      ACCEPTED: 'Aceita',
      REJECTED: 'Recusada',
      COUNTERED: 'Contraproposta',
      APPLIED: 'Aplicada',
    };
    return labels[status];
  }

  negotiationBadgeClass(status: NegotiationStatus): string {
    const classes: Record<NegotiationStatus, string> = {
      PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
      ACCEPTED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300',
      REJECTED: 'bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300',
      COUNTERED: 'bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300',
      APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
    };
    return classes[status];
  }

  timelineDotClass(status: NegotiationStatus): string {
    if (status === 'ACCEPTED' || status === 'APPLIED') return 'bg-emerald-500';
    if (status === 'PENDING') return 'bg-amber-500';
    if (status === 'REJECTED') return 'bg-red-500';
    return 'bg-violet-500';
  }

  private parsePriceToCents(value: string): number | null {
    const compact = value.trim().replace(/\s/g, '');
    const normalized = compact.includes(',')
      ? compact.replace(/\./g, '').replace(',', '.')
      : compact.replace(/\.(?=.*\.)/g, '');
    if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
    const amount = Number(normalized);
    if (!Number.isFinite(amount)) return null;
    return Math.round(amount * 100);
  }
}

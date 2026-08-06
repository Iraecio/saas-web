import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize, Observable } from 'rxjs';
import {
  ServiceNegotiationDetail,
  ServiceNegotiationSummary,
} from '../../../../core/models/service-negotiation.model';
import { ProfessionalRole, Service, ServiceScope } from '../../../../core/models/service.model';
import { AppStateService } from '../../../../core/services/app-state';
import { NotificationService } from '../../../../core/services/notification';
import {
  NegotiationDetailComponent,
  CounterDecision,
} from '../../components/negotiation-detail/negotiation-detail';
import { NegotiationListComponent } from '../../components/negotiation-list/negotiation-list';
import { ServiceListComponent } from '../../components/service-list/service-list';
import { NegotiationSummaryComponent } from '../../components/service-summary/negotiation-summary';
import { ServiceSummaryComponent } from '../../components/service-summary/service-summary';
import { ServiceCatalogService } from '../../services/service-catalog';
import { ServiceNegotiationService } from '../../services/service-negotiation';

type CatalogTab = 'services' | 'renegotiations';

@Component({
  selector: 'app-services-catalog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    ServiceSummaryComponent,
    ServiceListComponent,
    NegotiationSummaryComponent,
    NegotiationListComponent,
    NegotiationDetailComponent,
  ],
  template: `
    <main class="relative min-h-full overflow-hidden bg-canvas px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
      <div
        class="pointer-events-none absolute -right-40 -top-48 size-[34rem] rounded-full bg-brand/6 blur-3xl"
        aria-hidden="true"
      ></div>
      <div class="relative mx-auto max-w-[86rem] space-y-7">
        <header class="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div class="max-w-3xl">
            <p class="text-sm font-semibold text-brand">Operação comercial</p>
            <h1
              class="mt-2 text-3xl font-semibold tracking-[-0.035em] text-foreground text-balance sm:text-4xl"
            >
              Catálogo de serviços
            </h1>
            <p class="mt-3 max-w-[65ch] text-sm leading-6 text-muted sm:text-base">
              Gerencie ofertas de locução e produção e acompanhe cada conversa de valor com os
              profissionais.
            </p>
          </div>
          @if (tab() === 'services') {
            <a routerLink="new" class="btn-primary min-h-11">Novo serviço</a>
          } @else {
            <button
              type="button"
              class="btn-secondary min-h-11"
              [disabled]="loadingNegotiations()"
              (click)="loadNegotiations()"
            >
              Atualizar fila
            </button>
          }
        </header>

        <nav
          class="flex gap-1 border-b border-border"
          role="tablist"
          aria-label="Ferramentas do catálogo"
          (keydown)="onTabKeydown($event)"
        >
          <button
            id="tab-services"
            type="button"
            role="tab"
            class="relative min-h-12 px-4 text-sm font-semibold transition-colors"
            [class.text-foreground]="tab() === 'services'"
            [class.text-muted]="tab() !== 'services'"
            [attr.aria-selected]="tab() === 'services'"
            [attr.tabindex]="tab() === 'services' ? 0 : -1"
            aria-controls="panel-services"
            (click)="selectTab('services')"
          >
            Serviços
            @if (tab() === 'services') {
              <span class="absolute inset-x-2 bottom-0 h-0.5 bg-brand"></span>
            }
          </button>
          <button
            id="tab-renegotiations"
            type="button"
            role="tab"
            class="relative min-h-12 px-4 text-sm font-semibold transition-colors"
            [class.text-foreground]="tab() === 'renegotiations'"
            [class.text-muted]="tab() !== 'renegotiations'"
            [attr.aria-selected]="tab() === 'renegotiations'"
            [attr.tabindex]="tab() === 'renegotiations' ? 0 : -1"
            aria-controls="panel-renegotiations"
            (click)="selectTab('renegotiations')"
          >
            Renegociações
            @if (negotiationCounters().pendingManager > 0) {
              <span class="ml-1.5 rounded-md bg-warning/15 px-1.5 py-0.5 text-xs text-warning">{{
                negotiationCounters().pendingManager
              }}</span>
            }
            @if (tab() === 'renegotiations') {
              <span class="absolute inset-x-2 bottom-0 h-0.5 bg-brand"></span>
            }
          </button>
        </nav>

        @if (tab() === 'services') {
          <section
            id="panel-services"
            role="tabpanel"
            aria-labelledby="tab-services"
            class="space-y-6"
          >
            @if (loadingServices()) {
              <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
                @for (item of [1, 2, 3, 4, 5]; track item) {
                  <div class="h-24 animate-pulse rounded-xl bg-surface-subtle"></div>
                }
              </div>
              <div class="h-72 animate-pulse rounded-xl bg-surface-subtle"></div>
            } @else if (serviceError()) {
              <div
                role="alert"
                class="rounded-xl bg-danger/8 p-5 text-sm text-danger ring-1 ring-danger/20"
              >
                {{ serviceError() }}
                <button type="button" class="btn-link ml-2" (click)="loadServices()">
                  Tentar novamente
                </button>
              </div>
            } @else {
              <app-service-summary [services]="services()" />
              <div
                class="grid gap-4 rounded-xl bg-surface p-4 ring-1 ring-border sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_13rem_12rem_12rem]"
              >
                <label class="text-xs font-medium text-muted"
                  >Buscar serviço<input
                    class="form-input mt-1.5"
                    [value]="serviceSearch()"
                    (input)="serviceSearch.set($any($event.target).value)"
                    placeholder="Nome ou descrição"
                /></label>
                <label class="text-xs font-medium text-muted"
                  >Profissional<select
                    class="form-input mt-1.5"
                    [value]="serviceRole()"
                    (change)="serviceRole.set($any($event.target).value)"
                  >
                    <option value="">Todos</option>
                    <option value="VOICE_ACTOR">Locutor</option>
                    <option value="PRODUCER">Produtor</option>
                  </select></label
                >
                <label class="text-xs font-medium text-muted"
                  >Escopo<select
                    class="form-input mt-1.5"
                    [value]="serviceScope()"
                    (change)="serviceScope.set($any($event.target).value)"
                  >
                    <option value="">Todos</option>
                    <option value="GLOBAL">Global</option>
                    <option value="PARTICULAR">Revenda</option>
                  </select></label
                >
                <label class="text-xs font-medium text-muted"
                  >Status<select
                    class="form-input mt-1.5"
                    [value]="serviceStatus()"
                    (change)="serviceStatus.set($any($event.target).value)"
                  >
                    <option value="">Todos</option>
                    <option value="active">Ativos</option>
                    <option value="inactive">Inativos</option>
                  </select></label
                >
              </div>
              @if (filteredServices().length) {
                <app-service-list
                  [services]="filteredServices()"
                  [canManage]="canManage"
                  (toggle)="toggleService($event)"
                />
              } @else {
                <div
                  class="rounded-xl bg-surface px-6 py-12 text-center ring-1 ring-dashed ring-border-strong"
                >
                  <p class="font-semibold text-foreground">Nenhum serviço encontrado</p>
                  <p class="mt-1 text-sm text-muted">
                    Ajuste os filtros ou cadastre uma nova oferta.
                  </p>
                </div>
              }
            }
          </section>
        } @else {
          <section
            id="panel-renegotiations"
            role="tabpanel"
            aria-labelledby="tab-renegotiations"
            class="space-y-6"
          >
            <app-negotiation-summary [counters]="negotiationCounters()" />
            <div
              class="grid gap-4 rounded-xl bg-surface p-4 ring-1 ring-border sm:grid-cols-2 lg:grid-cols-[minmax(16rem,1fr)_13rem_13rem]"
            >
              <label class="text-xs font-medium text-muted"
                >Buscar<input
                  class="form-input mt-1.5"
                  [value]="negotiationSearch()"
                  (input)="onNegotiationSearch($any($event.target).value)"
                  placeholder="Profissional ou serviço"
              /></label>
              <label class="text-xs font-medium text-muted"
                >Responsável<select
                  class="form-input mt-1.5"
                  [value]="negotiationNextActor()"
                  (change)="onNextActor($any($event.target).value)"
                >
                  <option value="">Todos</option>
                  <option value="MANAGER">Aguardando você</option>
                  <option value="PROFESSIONAL">Aguardando profissional</option>
                  <option value="NONE">Finalizadas</option>
                </select></label
              >
              <label class="text-xs font-medium text-muted"
                >Profissional<select
                  class="form-input mt-1.5"
                  [value]="negotiationRole()"
                  (change)="onNegotiationRole($any($event.target).value)"
                >
                  <option value="">Todos</option>
                  <option value="VOICE_ACTOR">Locutor</option>
                  <option value="PRODUCER">Produtor</option>
                </select></label
              >
            </div>
            @if (loadingNegotiations()) {
              <div class="space-y-3">
                @for (item of [1, 2, 3]; track item) {
                  <div class="h-28 animate-pulse rounded-xl bg-surface-subtle"></div>
                }
              </div>
            } @else if (negotiationError()) {
              <div
                role="alert"
                class="rounded-xl bg-danger/8 p-5 text-sm text-danger ring-1 ring-danger/20"
              >
                {{ negotiationError() }}
                <button type="button" class="btn-link ml-2" (click)="loadNegotiations()">
                  Tentar novamente
                </button>
              </div>
            } @else if (negotiations().length) {
              <app-negotiation-list [items]="negotiations()" (select)="openNegotiation($event)" />
            } @else {
              <div
                class="rounded-xl bg-surface px-6 py-12 text-center ring-1 ring-dashed ring-border-strong"
              >
                <p class="font-semibold text-foreground">Nenhuma renegociação encontrada</p>
                <p class="mt-1 text-sm text-muted">Não há conversas com os filtros selecionados.</p>
              </div>
            }
          </section>
        }
      </div>
    </main>

    @if (selectedNegotiation()) {
      <app-negotiation-detail
        [detail]="selectedNegotiation()!"
        [busy]="decisionBusy()"
        (close)="closeNegotiation()"
        (accept)="acceptNegotiation()"
        (reject)="rejectNegotiation($event)"
        (counter)="counterNegotiation($event)"
      />
    }
  `,
})
export class ServicesCatalogPage {
  private readonly catalog = inject(ServiceCatalogService);
  private readonly negotiationService = inject(ServiceNegotiationService);
  private readonly appState = inject(AppStateService);
  private readonly notify = inject(NotificationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly tab = signal<CatalogTab>('services');
  readonly services = signal<Service[]>([]);
  readonly loadingServices = signal(true);
  readonly serviceError = signal<string | null>(null);
  readonly serviceSearch = signal('');
  readonly serviceRole = signal<ProfessionalRole | ''>('');
  readonly serviceScope = signal<ServiceScope | ''>('');
  readonly serviceStatus = signal<'' | 'active' | 'inactive'>('');
  readonly negotiations = signal<ServiceNegotiationSummary[]>([]);
  readonly negotiationCounters = signal({ pendingManager: 0, pendingProfessional: 0, finished: 0 });
  readonly loadingNegotiations = signal(false);
  readonly negotiationError = signal<string | null>(null);
  readonly negotiationSearch = signal('');
  readonly negotiationNextActor = signal<'' | 'MANAGER' | 'PROFESSIONAL' | 'NONE'>('');
  readonly negotiationRole = signal<ProfessionalRole | ''>('');
  readonly selectedNegotiation = signal<ServiceNegotiationDetail | null>(null);
  readonly decisionBusy = signal(false);
  private previousFocus: HTMLElement | null = null;

  readonly filteredServices = computed(() => {
    const query = this.serviceSearch().trim().toLocaleLowerCase('pt-BR');
    return this.services().filter((service) => {
      const textMatches =
        !query ||
        `${service.name} ${service.description ?? ''}`.toLocaleLowerCase('pt-BR').includes(query);
      const roleMatches = !this.serviceRole() || service.professionalRole === this.serviceRole();
      const scopeMatches = !this.serviceScope() || service.scope === this.serviceScope();
      const statusMatches =
        !this.serviceStatus() ||
        (this.serviceStatus() === 'active' ? service.isActive : !service.isActive);
      return textMatches && roleMatches && scopeMatches && statusMatches;
    });
  });

  readonly canManage = (service: Service): boolean => {
    if (service.scope === 'GLOBAL') return this.appState.isAdmin();
    return this.appState.isReseller() && service.ownerId === this.appState.user()?.resellerId;
  };

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      const tab = params.get('tab');
      this.tab.set(tab === 'renegotiations' ? 'renegotiations' : 'services');
      if (this.tab() === 'renegotiations' && !this.negotiations().length) this.loadNegotiations();
      const negotiationId = params.get('negotiation');
      if (negotiationId) this.loadNegotiationDetail(negotiationId);
    });
    this.loadServices();
  }

  selectTab(tab: CatalogTab): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab, negotiation: null },
      queryParamsHandling: 'merge',
    });
  }

  onTabKeydown(event: KeyboardEvent): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    this.selectTab(this.tab() === 'services' ? 'renegotiations' : 'services');
  }

  loadServices(): void {
    this.loadingServices.set(true);
    this.serviceError.set(null);
    this.catalog
      .list({ includeInactive: true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingServices.set(false)),
      )
      .subscribe({
        next: (items) => this.services.set(items),
        error: (error: Error) =>
          this.serviceError.set(error.message || 'Não foi possível carregar os serviços.'),
      });
  }

  toggleService(service: Service): void {
    const request: Observable<unknown> = service.isActive
      ? this.catalog.deactivate(service.id)
      : this.catalog.activate(service.id);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.notify.success(service.isActive ? 'Serviço inativado.' : 'Serviço reativado.');
        this.loadServices();
      },
      error: (error: Error) =>
        this.notify.error(error.message || 'Não foi possível atualizar o serviço.'),
    });
  }

  loadNegotiations(): void {
    this.loadingNegotiations.set(true);
    this.negotiationError.set(null);
    this.negotiationService
      .list({
        search: this.negotiationSearch(),
        nextActor: this.negotiationNextActor(),
        professionalRole: this.negotiationRole(),
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loadingNegotiations.set(false)),
      )
      .subscribe({
        next: (page) => {
          this.negotiations.set(page.items);
          this.negotiationCounters.set(page.counters);
        },
        error: (error: Error) =>
          this.negotiationError.set(error.message || 'Não foi possível carregar as renegociações.'),
      });
  }

  onNegotiationSearch(value: string): void {
    this.negotiationSearch.set(value);
    this.loadNegotiations();
  }
  onNextActor(value: '' | 'MANAGER' | 'PROFESSIONAL' | 'NONE'): void {
    this.negotiationNextActor.set(value);
    this.loadNegotiations();
  }
  onNegotiationRole(value: ProfessionalRole | ''): void {
    this.negotiationRole.set(value);
    this.loadNegotiations();
  }

  openNegotiation(item: ServiceNegotiationSummary): void {
    if (typeof document !== 'undefined') {
      this.previousFocus = document.activeElement as HTMLElement | null;
    }
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab: 'renegotiations', negotiation: item.id },
      queryParamsHandling: 'merge',
    });
  }

  closeNegotiation(): void {
    this.selectedNegotiation.set(null);
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { negotiation: null },
      queryParamsHandling: 'merge',
    });
    queueMicrotask(() => this.previousFocus?.focus());
  }

  acceptNegotiation(): void {
    const item = this.selectedNegotiation();
    if (!item) return;
    this.runDecision(
      this.negotiationService.accept(item.professional.id, item.service.id, item.id),
    );
  }

  rejectNegotiation(notes: string): void {
    const item = this.selectedNegotiation();
    if (!item) return;
    this.runDecision(
      this.negotiationService.reject(item.professional.id, item.service.id, item.id, notes),
    );
  }

  counterNegotiation(decision: CounterDecision): void {
    const item = this.selectedNegotiation();
    if (!item) return;
    this.runDecision(
      this.negotiationService.counter(
        item.professional.id,
        item.service.id,
        item.id,
        decision.proposedPriceCents,
        decision.notes,
      ),
    );
  }

  private loadNegotiationDetail(id: string): void {
    this.negotiationService
      .detail(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (detail) => this.selectedNegotiation.set(detail),
        error: (error: Error) => {
          this.notify.error(error.message || 'Não foi possível abrir a renegociação.');
          this.closeNegotiation();
        },
      });
  }

  private runDecision(request: Observable<unknown>): void {
    const id = this.selectedNegotiation()?.id;
    this.decisionBusy.set(true);
    request
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.decisionBusy.set(false)),
      )
      .subscribe({
        next: () => {
          this.notify.success('Renegociação atualizada.');
          this.loadNegotiations();
          if (id) this.loadNegotiationDetail(id);
        },
        error: (error: Error) => {
          this.notify.error(error.message || 'A solicitação mudou. Os dados serão atualizados.');
          if (id) this.loadNegotiationDetail(id);
        },
      });
  }
}
